const { callApi } = require('../../utils/api');
const { getCurrentChildId, setCurrentChildId } = require('../../utils/store');

Page({
  data: {
    familyName: '',
    children: [],
    currentChildId: 'child-younger',
    currentChildName: '',
    balance: 0,
    rewards: [],
    pk: null,
    recentRedemptions: [],
    redeemableCount: 0,
    nextRewardTitle: ''
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.loadPage();
  },

  async loadPage() {
    const bootstrap = await callApi('bootstrapFamily');
    if (bootstrap.needsFamilySetup) {
      wx.switchTab({ url: '/pages/mine/index' });
      return;
    }
    const childMembers = (bootstrap.members || []).filter((member) => member.isChild);
    const storedChildId = getCurrentChildId() || this.data.currentChildId;
    const currentChildId = childMembers.some((member) => member.memberId === storedChildId)
      ? storedChildId
      : (childMembers[0] && childMembers[0].memberId);
    if (currentChildId) {
      setCurrentChildId(currentChildId);
    }
    const result = await callApi('getRewards', { childId: currentChildId });
    const currentChild = childMembers.find((member) => member.memberId === currentChildId) || childMembers[0] || {};
    const rewards = result.rewards || [];
    const redeemableRewards = rewards.filter((reward) => (result.balance || 0) >= (reward.thresholdValue || 0));
    const nextReward = rewards
      .filter((reward) => (result.balance || 0) < (reward.thresholdValue || 0))
      .sort((left, right) => left.thresholdValue - right.thresholdValue)[0];

    this.setData({
      currentChildId,
      currentChildName: currentChild.displayName || '',
      familyName: bootstrap.family ? bootstrap.family.familyName : '我们一家',
      children: childMembers,
      balance: result.balance,
      rewards,
      pk: result.pk,
      recentRedemptions: result.recentRedemptions || [],
      redeemableCount: redeemableRewards.length,
      nextRewardTitle: nextReward ? nextReward.title : ''
    });
  },

  onChildChange(event) {
    const { childId } = event.detail;
    setCurrentChildId(childId);
    this.setData({ currentChildId: childId });
    this.loadPage();
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
    await this.loadPage();
  }
});
