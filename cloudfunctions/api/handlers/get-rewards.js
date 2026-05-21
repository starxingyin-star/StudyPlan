const { DEFAULT_REWARD_PRESETS } = require('../common/templates');
const { buildFamilyPk } = require('../common/summary-service');

async function getRewards({ payload }) {
  const childId = payload.childId || 'child-younger';
  const balances = {
    'child-older': 12,
    'child-younger': 10
  };
  const pk = buildFamilyPk([
    { childId: 'child-older', childName: '姐姐', totalPoints: 12, completionRate: 0.8, streakDays: 5 },
    { childId: 'child-younger', childName: '弟弟', totalPoints: 10, completionRate: 1, streakDays: 4 }
  ]);

  return {
    childId,
    balance: balances[childId] || 0,
    rewards: DEFAULT_REWARD_PRESETS.map((reward, index) => ({
      rewardRuleId: `reward-${index + 1}`,
      ...reward
    })),
    pk
  };
}

module.exports = {
  getRewards
};
