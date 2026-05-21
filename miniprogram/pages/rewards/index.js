const { callApi } = require('../../utils/api');
const { getCurrentChildId, setCurrentChildId } = require('../../utils/store');

Page({
  data: {
    children: [],
    currentChildId: '',
    balance: 0,
    rewards: [],
    pk: null
  },

  async onShow() {
    const currentChildId = getCurrentChildId();
    const result = await callApi('getRewards', { childId: currentChildId });

    this.setData({
      currentChildId,
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
  }
});
