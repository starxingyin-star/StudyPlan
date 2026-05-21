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
    const currentChildId = getCurrentChildId() || this.data.currentChildId;
    const result = await callApi('getRewards', { childId: currentChildId });

    this.setData({
      currentChildId,
      children: [
        { memberId: 'child-older', displayName: '姐姐' },
        { memberId: 'child-younger', displayName: '弟弟' }
      ],
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
      thresholdValue: Number(threshold),
      currentPoints: this.data.balance
    });

    this.setData({
      balance: this.data.balance + result.pointLedger.deltaPoints
    });
  }
});
