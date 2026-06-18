const { callApi } = require('../../utils/api');
const { requirePin } = require('../../utils/pin');
const { enableShareMenu, getShareAppMessage } = require('../../utils/share');

Page({
  data: {
    familyName: '',
    members: [],
    relationOptions: ['child', 'father', 'mother', 'grandfather', 'grandmother', 'guardian'],
    newMemberName: '',
    newMemberRelationIndex: 0,
    newMemberGrade: '',
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
      members: bootstrap.members || []
    });
  },

  onShareAppMessage() {
    return getShareAppMessage();
  },

  async onTapSaveSettings() {
    try {
      const pin = await requirePin(this, '保存家庭设置');
      if (!pin) {
        throw new Error('请输入家长密码');
      }
      const result = await callApi('saveFamilySettings', {
        familyName: this.data.familyName,
        members: this.data.members,
        rewards: [],
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
