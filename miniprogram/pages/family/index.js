const { callApi } = require('../../utils/api');
const { requirePin } = require('../../utils/pin');

Page({
  data: {
    familyName: '',
    members: [],
    rewards: [],
    pinVisible: false,
    pinActionName: ''
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
      this.setData({ pinVisible: false });
    } catch (error) {
      this.setData({ pinVisible: false });
    }
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
