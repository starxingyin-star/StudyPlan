const {
  collections,
  DEFAULT_FAMILY_ID,
  getDocOrNull,
  setDoc
} = require('../common/db');
const { verifyPin } = require('../common/pin-service');

async function saveFamilySettings({ payload }) {
  const family = await getDocOrNull(collections.families, DEFAULT_FAMILY_ID);
  const storedPin = family ? family.parentPin : '2468';

  if (!verifyPin({ storedPin, enteredPin: payload.pin })) {
    throw new Error('Invalid PIN');
  }

  const nextFamily = {
    ...(family || {}),
    familyId: DEFAULT_FAMILY_ID,
    familyName: payload.familyName || (family && family.familyName) || '我们一家',
    parentPin: storedPin,
    pkEnabled: family ? family.pkEnabled : true,
    updatedAt: new Date().toISOString()
  };

  await setDoc(collections.families, DEFAULT_FAMILY_ID, nextFamily);

  const existingMembersResult = await collections.members.where({ familyId: DEFAULT_FAMILY_ID }).get();
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
    await setDoc(collections.members, member.memberId, {
      ...member,
      familyId: DEFAULT_FAMILY_ID,
      isActive: true
    });
  }

  const existingRewardsResult = await collections.rewardRules.where({ familyId: DEFAULT_FAMILY_ID }).get();
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
    const rewardRuleId = reward.rewardRuleId || `reward-${reward.sortOrder || Date.now()}`;
    await setDoc(collections.rewardRules, rewardRuleId, {
      ...reward,
      rewardRuleId,
      familyId: DEFAULT_FAMILY_ID,
      scopeType: reward.scopeType || 'family',
      childId: reward.childId || '',
      enabled: reward.enabled !== false
    });
  }

  const refreshedMembers = await collections.members.where({ familyId: DEFAULT_FAMILY_ID }).get();
  const refreshedRewards = await collections.rewardRules.where({ familyId: DEFAULT_FAMILY_ID }).get();

  return {
    ok: true,
    familyId: DEFAULT_FAMILY_ID,
    family: nextFamily,
    members: refreshedMembers.data,
    rewards: refreshedRewards.data
  };
}

module.exports = {
  saveFamilySettings
};
