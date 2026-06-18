const { callApi } = require('../../utils/api');
const { requirePin } = require('../../utils/pin');
const { enableShareMenu, getShareAppMessage } = require('../../utils/share');

Page({
  data: {
    familyName: '',
    members: [],
    rewards: [],
    newRewardTitle: '',
    newRewardThreshold: 5,
    pinVisible: false,
    pinActionName: ''
  },

  async onShow() {
    enableShareMenu();
    const bootstrap = await callApi('bootstrapFamily');
    if (bootstrap.needsFamilySetup) {
      wx.switchTab({ url: '/pages/mine/index' });
      return;
    }
    this.setData({
      familyName: bootstrap.family ? bootstrap.family.familyName : '',
      members: bootstrap.members || [],
      rewards: bootstrap.rewardPresets || []
    });
  },

  onShareAppMessage() {
    return getShareAppMessage();
  },

  async onTapSaveSettings() {
    try {
      const pin = await requirePin(this, '保存奖励规则');
      if (!pin) {
        throw new Error('请输入家长密码');
      }
      const result = await callApi('saveFamilySettings', {
        familyName: this.data.familyName,
        members: this.data.members,
        rewards: this.data.rewards,
        pin
      });

      if (!result || !result.ok) {
        throw new Error('保存失败');
      }

      wx.showToast({
        title: '已保存',
        icon: 'success'
      });
      this.setData({
        pinVisible: false,
        pinActionName: ''
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 350);
    } catch (error) {
      this.setData({
        pinVisible: false,
        pinActionName: ''
      });
      wx.showToast({
        title: error && error.message ? error.message : '保存失败',
        icon: 'none'
      });
    }
  },

  onRewardTitleInput(event) {
    const { index } = event.currentTarget.dataset;
    const rewards = [...this.data.rewards];
    rewards[index] = {
      ...rewards[index],
      title: event.detail.value
    };
    this.setData({ rewards });
  },

  onRewardThresholdInput(event) {
    const { index } = event.currentTarget.dataset;
    const rewards = [...this.data.rewards];
    rewards[index] = {
      ...rewards[index],
      thresholdValue: Number(event.detail.value || 0)
    };
    this.setData({ rewards });
  },

  onNewRewardTitleInput(event) {
    this.setData({
      newRewardTitle: event.detail.value
    });
  },

  onNewRewardThresholdInput(event) {
    this.setData({
      newRewardThreshold: Number(event.detail.value || 0)
    });
  },

  onAddReward() {
    const title = (this.data.newRewardTitle || '').trim();
    if (!title) {
      return;
    }

    const rewardRuleId = `reward-custom-${Date.now()}`;
    const nextRewards = [...this.data.rewards, {
      rewardRuleId,
      title,
      rewardType: 'item',
      unlockMode: 'points',
      thresholdValue: this.data.newRewardThreshold || 5,
      scopeType: 'family',
      childId: '',
      enabled: true,
      sortOrder: this.data.rewards.length + 1
    }];

    this.setData({
      rewards: nextRewards,
      newRewardTitle: '',
      newRewardThreshold: 5
    });
  },

  onRemoveReward(event) {
    const { rewardRuleId } = event.currentTarget.dataset;
    const nextRewards = this.data.rewards
      .filter((reward) => reward.rewardRuleId !== rewardRuleId)
      .map((reward, index) => ({
        ...reward,
        sortOrder: index + 1
      }));

    this.setData({
      rewards: nextRewards
    });
  },

  onPinConfirm(event) {
    if (typeof this._pinResolve === 'function') {
      this._pinResolve(event.detail.pin);
    }
    this._pinResolve = null;
    this._pinReject = null;
    this.setData({
      pinVisible: false,
      pinActionName: ''
    });
  },

  onPinCancel() {
    if (typeof this._pinReject === 'function') {
      this._pinReject(new Error('PIN cancelled'));
    }
    this._pinResolve = null;
    this._pinReject = null;
    this.setData({
      pinVisible: false,
      pinActionName: ''
    });
  }
});
