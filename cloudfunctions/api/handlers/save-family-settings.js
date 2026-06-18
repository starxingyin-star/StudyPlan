const {
  collections,
  buildScopedId,
  getDocOrNull,
  setDoc
} = require('../common/db');
const { resolveFamilyAuth } = require('../common/family-service');
const { verifyPin } = require('../common/pin-service');

async function saveFamilySettings({ payload, authContext }) {
  const auth = await resolveFamilyAuth({
    collections,
    openid: authContext && authContext.openid
  });
  const family = await getDocOrNull(collections.families, auth.familyId);
  const storedPin = family ? family.parentPin : '2468';

  if (!verifyPin({ storedPin, enteredPin: payload.pin })) {
    throw new Error('Invalid PIN');
  }

  const nextFamily = {
    ...(family || {}),
    familyId: auth.familyId,
    familyName: payload.familyName || (family && family.familyName) || '我们一家',
    parentPin: storedPin,
    pkEnabled: family ? family.pkEnabled : true,
    updatedAt: new Date().toISOString()
  };

  await setDoc(collections.families, auth.familyId, nextFamily);

  const existingMembersResult = await collections.members.where({ familyId: auth.familyId }).get();
  const nextMemberIds = new Set((payload.members || []).map((member) => member.memberId));
  for (const existingMember of existingMembersResult.data) {
    if (!nextMemberIds.has(existingMember.memberId)) {
      try {
        await collections.members.doc(existingMember.memberId).remove();
      } catch (error) {
        // ignore delete failures for missing docs
      }
    }
  }

  for (const member of payload.members || []) {
    const memberId = member.memberId || buildScopedId(auth.familyId, `member-${Date.now()}`);
    await setDoc(collections.members, memberId, {
      ...member,
      memberId,
      familyId: auth.familyId,
      isActive: true
    });
  }

  const existingRewardsResult = await collections.rewardRules.where({ familyId: auth.familyId }).get();
  const nextRewardIds = new Set((payload.rewards || []).map((reward) => reward.rewardRuleId || `reward-${reward.sortOrder || Date.now()}`));
  for (const existingReward of existingRewardsResult.data) {
    if (!nextRewardIds.has(existingReward.rewardRuleId)) {
      try {
        await collections.rewardRules.doc(existingReward.rewardRuleId).remove();
      } catch (error) {
        // ignore delete failures for missing docs
      }
    }
  }

  for (const reward of payload.rewards || []) {
    const rewardRuleId = reward.rewardRuleId || buildScopedId(auth.familyId, `reward-${reward.sortOrder || Date.now()}`);
    await setDoc(collections.rewardRules, rewardRuleId, {
      ...reward,
      rewardRuleId,
      familyId: auth.familyId,
      scopeType: reward.scopeType || 'family',
      childId: reward.childId || '',
      enabled: reward.enabled !== false
    });
  }

  const refreshedMembers = await collections.members.where({ familyId: auth.familyId }).get();
  const refreshedRewards = await collections.rewardRules.where({ familyId: auth.familyId }).get();

  return {
    ok: true,
    familyId: auth.familyId,
    family: nextFamily,
    members: refreshedMembers.data,
    rewards: refreshedRewards.data
  };
}

module.exports = {
  saveFamilySettings
};
