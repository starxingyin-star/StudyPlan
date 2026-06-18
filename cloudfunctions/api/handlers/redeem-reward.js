const { collections, ensureFamilySeed, getDocOrNull } = require('../common/db');
const { resolveFamilyAuth } = require('../common/family-service');
const { resolveChildId } = require('../common/member-service');
const { buildRewardRedemption } = require('../common/reward-service');

async function redeemReward({ payload, authContext }) {
  const auth = await resolveFamilyAuth({
    collections,
    openid: authContext && authContext.openid
  });
  await ensureFamilySeed(collections, auth.familyId, {
    familyName: auth.family.familyName,
    parentPin: auth.family.parentPin
  });

  const childId = await resolveChildId({
    collections,
    familyId: auth.familyId,
    requestedChildId: payload.childId
  });

  const rewardRule = await getDocOrNull(collections.rewardRules, payload.rewardRuleId);
  if (!rewardRule || rewardRule.familyId !== auth.familyId) {
    throw new Error('Reward not found');
  }

  const ledgersResult = await collections.pointLedgers.where({
    familyId: auth.familyId,
    childId
  }).get();
  const currentPoints = ledgersResult.data.reduce((sum, item) => sum + item.deltaPoints, 0);

  const result = buildRewardRedemption({
    childId,
    rewardRule,
    currentPoints,
    requestedAt: payload.requestedAt || new Date().toISOString(),
    approvedByMemberId: payload.approvedByMemberId || 'member-father'
  });

  await collections.rewardRedemptions.add({
    data: {
      ...result.redemption,
      familyId: auth.familyId
    }
  });

  await collections.pointLedgers.add({
    data: {
      ...result.pointLedger,
      familyId: auth.familyId,
      createdAt: new Date().toISOString()
    }
  });

  return {
    ok: true,
    rewardRuleId: payload.rewardRuleId,
    redemption: result.redemption,
    pointLedger: result.pointLedger
  };
}

module.exports = {
  redeemReward
};
