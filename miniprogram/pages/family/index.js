const { callApi } = require('../../utils/api');
const { requirePin } = require('../../utils/pin');

Page({
  data: {
    familyName: '',
    members: [],
    rewards: [],
    relationOptions: ['child', 'father', 'mother', 'grandfather', 'grandmother', 'guardian'],
    newMemberName: '',
    newMemberRelationIndex: 0,
    newMemberGrade: '',
    newRewardTitle: '',
    newRewardThreshold: 5,
    pinVisible: false,
    pinActionName: ''
  },

  async onShow() {
    const bootstrap = await callApi('bootstrapFamily');
    this.setData({
      familyName: bootstrap.family ? bootstrap.family.familyName : '',
      members: bootstrap.members || [],
      rewards: bootstrap.rewardPresets || []
    });
  },

  async onTapSaveSettings() {
    try {
      const pin = await requirePin(this, '保存家庭设置');
      await callApi('saveFamilySettings', {
        familyName: this.data.familyName,
        members: this.data.members,
        rewards: this.data.rewards,
        pin
      });
      wx.showToast({
        title: '已保存',
        icon: 'success'
      });
      await this.onShow();
      this.setData({ pinVisible: false });
    } catch (error) {
      this.setData({ pinVisible: false });
    }
  },

  onFamilyNameInput(event) {
    this.setData({
      familyName: event.detail.value
    });
  },

  onNewMemberNameInput(event) {
    this.setData({
      newMemberName: event.detail.value
    });
  },

  onNewMemberRelationChange(event) {
    this.setData({
      newMemberRelationIndex: Number(event.detail.value)
    });
  },

  onNewMemberGradeInput(event) {
    this.setData({
      newMemberGrade: event.detail.value
    });
  },

  onAddMember() {
    const displayName = (this.data.newMemberName || '').trim();
    const relationType = this.data.relationOptions[this.data.newMemberRelationIndex];
    if (!displayName) {
      return;
    }

    const memberId = `member-${Date.now()}`;
    const isChild = relationType === 'child';
    const nextMembers = [...this.data.members, {
      memberId,
      displayName,
      relationType,
      isChild,
      grade: isChild ? this.data.newMemberGrade : ''
    }];

    this.setData({
      members: nextMembers,
      newMemberName: '',
      newMemberRelationIndex: 0,
      newMemberGrade: ''
    });
  },

  onRemoveMember(event) {
    const { memberId } = event.currentTarget.dataset;
    this.setData({
      members: this.data.members.filter((member) => member.memberId !== memberId)
    });
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
