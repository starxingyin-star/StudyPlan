const { buildRewardRedemption } = require('../common/reward-service');

async function redeemReward({ payload }) {
  const rewardRule = {
    rewardRuleId: payload.rewardRuleId,
    title: payload.title,
    thresholdValue: payload.thresholdValue
  };

  const result = buildRewardRedemption({
    childId: payload.childId,
    rewardRule,
    currentPoints: payload.currentPoints,
    requestedAt: payload.requestedAt || new Date().toISOString(),
    approvedByMemberId: payload.approvedByMemberId || 'member-father'
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
