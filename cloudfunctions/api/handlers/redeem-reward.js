const { collections, DEFAULT_FAMILY_ID, ensureDefaultSeed, getDocOrNull } = require('../common/db');
const { buildRewardRedemption } = require('../common/reward-service');

async function redeemReward({ payload }) {
  await ensureDefaultSeed(collections);

  const rewardRule = await getDocOrNull(collections.rewardRules, payload.rewardRuleId);
  if (!rewardRule) {
    throw new Error('Reward not found');
  }

  const ledgersResult = await collections.pointLedgers.where({
    familyId: DEFAULT_FAMILY_ID,
    childId: payload.childId
  }).get();
  const currentPoints = ledgersResult.data.reduce((sum, item) => sum + item.deltaPoints, 0);

  const result = buildRewardRedemption({
    childId: payload.childId,
    rewardRule,
    currentPoints,
    requestedAt: payload.requestedAt || new Date().toISOString(),
    approvedByMemberId: payload.approvedByMemberId || 'member-father'
  });

  await collections.rewardRedemptions.add({
    data: {
      ...result.redemption,
      familyId: DEFAULT_FAMILY_ID
    }
  });

  await collections.pointLedgers.add({
    data: {
      ...result.pointLedger,
      familyId: DEFAULT_FAMILY_ID,
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
