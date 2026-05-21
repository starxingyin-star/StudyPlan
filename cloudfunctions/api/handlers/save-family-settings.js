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

  for (const member of payload.members || []) {
    await setDoc(collections.members, member.memberId, {
      ...member,
      familyId: DEFAULT_FAMILY_ID,
      isActive: true
    });
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

  return {
    ok: true,
    familyId: DEFAULT_FAMILY_ID
  };
}

module.exports = {
  saveFamilySettings
};
