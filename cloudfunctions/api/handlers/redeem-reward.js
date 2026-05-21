async function redeemReward({ payload }) {
  return {
    ok: true,
    rewardRuleId: payload.rewardRuleId
  };
}

module.exports = {
  redeemReward
};
