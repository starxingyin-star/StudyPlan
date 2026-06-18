function buildRewardRedemption({
  childId,
  rewardRule,
  currentPoints,
  requestedAt,
  approvedByMemberId
}) {
  if (currentPoints < rewardRule.thresholdValue) {
    throw new Error('Insufficient points');
  }

  return {
    redemption: {
      childId,
      rewardRuleId: rewardRule.rewardRuleId,
      rewardTitle: rewardRule.title,
      status: 'approved',
      pointsSpent: rewardRule.thresholdValue,
      requestedAt,
      approvedAt: requestedAt,
      fulfilledAt: null,
      approvedByMemberId
    },
    pointLedger: {
      childId,
      deltaPoints: rewardRule.thresholdValue * -1,
      sourceType: 'reward_redeem',
      relatedRewardRuleId: rewardRule.rewardRuleId,
      note: rewardRule.title
    }
  };
}

module.exports = {
  buildRewardRedemption
};
