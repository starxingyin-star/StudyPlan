const { callApi } = require('../../utils/api');
const { getCurrentChildId, setCurrentChildId } = require('../../utils/store');

Page({
  data: {
    children: [],
    currentChildId: 'child-younger',
    balance: 0,
    rewards: [],
    pk: null
  },

  async onShow() {
    const bootstrap = await callApi('bootstrapFamily');
    const childMembers = (bootstrap.members || []).filter((member) => member.isChild);
    const currentChildId = getCurrentChildId() || this.data.currentChildId || (childMembers[0] && childMembers[0].memberId);
    const result = await callApi('getRewards', { childId: currentChildId });

    this.setData({
      currentChildId,
      children: childMembers,
      balance: result.balance,
      rewards: result.rewards,
      pk: result.pk
    });
  },

  onChildChange(event) {
    const { childId } = event.detail;
    setCurrentChildId(childId);
    this.setData({ currentChildId: childId });
    this.onShow();
  },

  async onTapRedeem(event) {
    const { rewardRuleId, title, threshold } = event.currentTarget.dataset;
    const result = await callApi('redeemReward', {
      childId: this.data.currentChildId,
      rewardRuleId,
      title,
      thresholdValue: Number(threshold)
    });

    this.setData({
      balance: this.data.balance + result.pointLedger.deltaPoints
    });
  }
});
