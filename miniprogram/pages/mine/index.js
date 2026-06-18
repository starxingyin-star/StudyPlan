const { callApi } = require('../../utils/api');
const { enableShareMenu, getShareAppMessage } = require('../../utils/share');

Page({
  data: {
    needsFamilySetup: false,
    familyNameDraft: '',
    parentPinDraft: '',
    inviteTokenDraft: '',
    generatedInviteToken: '',
    overview: {
      familyName: '我们一家',
      childCount: 2,
      rewardCount: 4
    }
  },

  async onShow() {
    enableShareMenu();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }

    const bootstrap = await callApi('bootstrapFamily');
    if (bootstrap.needsFamilySetup) {
      this.setData({
        needsFamilySetup: true,
        overview: {
          familyName: '创建或加入家庭',
          childCount: 0,
          rewardCount: 0
        }
      });
      return;
    }

    const members = bootstrap.members || [];
    const rewardPresets = bootstrap.rewardPresets || [];
    const childCount = members.filter((member) => member.isChild).length;

    this.setData({
      needsFamilySetup: false,
      overview: {
        familyName: bootstrap.family ? bootstrap.family.familyName : '我们一家',
        childCount,
        rewardCount: rewardPresets.length
      }
    });
  },

  onShareAppMessage() {
    return getShareAppMessage();
  },

  onFamilyNameDraftInput(event) {
    this.setData({ familyNameDraft: event.detail.value });
  },

  onParentPinDraftInput(event) {
    this.setData({ parentPinDraft: event.detail.value });
  },

  onInviteTokenDraftInput(event) {
    const token = String(event.detail.value || '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 6);
    this.setData({ inviteTokenDraft: token });
  },

  async onCreateFamily() {
    try {
      await callApi('createFamily', {
        familyName: (this.data.familyNameDraft || '').trim() || '我们一家',
        parentPin: (this.data.parentPinDraft || '').trim() || '2468'
      });
      this.setData({
        familyNameDraft: '',
        parentPinDraft: ''
      });
      wx.showToast({ title: '已创建', icon: 'success' });
      await this.onShow();
    } catch (error) {
      wx.showToast({
        title: error && error.message ? error.message : '创建失败',
        icon: 'none'
      });
    }
  },

  async onJoinFamily() {
    const token = (this.data.inviteTokenDraft || '').trim().toUpperCase();
    if (!token) {
      wx.showToast({ title: '请输入邀请码', icon: 'none' });
      return;
    }

    try {
      await callApi('joinFamily', { token });
      this.setData({
        inviteTokenDraft: ''
      });
      wx.showToast({ title: '已加入', icon: 'success' });
      await this.onShow();
    } catch (error) {
      wx.showToast({
        title: error && error.message ? error.message : '加入失败',
        icon: 'none'
      });
    }
  },

  async onCreateInvite() {
    try {
      const result = await callApi('createFamilyInvite');
      this.setData({ generatedInviteToken: result.token || '' });
      wx.showToast({ title: '已生成', icon: 'success' });
    } catch (error) {
      wx.showToast({
        title: error && error.message ? error.message : '生成失败',
        icon: 'none'
      });
    }
  },

  onCopyInviteToken() {
    const token = (this.data.generatedInviteToken || '').trim();
    if (!token) {
      wx.showToast({ title: '请先生成邀请码', icon: 'none' });
      return;
    }

    wx.setClipboardData({
      data: token,
      success() {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  },

  goToWeeklyPlan() {
    wx.navigateTo({ url: '/pages/weekly-plan/index' });
  },

  goToWeeklyReview() {
    wx.navigateTo({ url: '/pages/weekly-review/index' });
  },

  goToFamily() {
    wx.navigateTo({ url: '/pages/family/index' });
  },

  goToRewardSettings() {
    wx.navigateTo({ url: '/pages/reward-settings/index' });
  }
});
