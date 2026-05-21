const { callApi } = require('../../utils/api');
const { getCurrentChildId, setCurrentChildId } = require('../../utils/store');
const { requirePin } = require('../../utils/pin');

Page({
  data: {
    children: [],
    currentChildId: '',
    weekStartDate: '',
    dayTabs: [],
    activeDay: '',
    tasks: [],
    pinVisible: false,
    pinActionName: ''
  },

  onShow() {
    const currentChildId = getCurrentChildId();
    this.setData({ currentChildId });
  },

  async onTapSavePlan() {
    try {
      const pin = await requirePin(this, '保存本周计划');
      await callApi('saveWeeklyPlan', {
        childId: this.data.currentChildId,
        weekStartDate: this.data.weekStartDate,
        tasks: this.data.tasks,
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
  },

  onChildChange(event) {
    const { childId } = event.detail;
    setCurrentChildId(childId);
    this.setData({ currentChildId: childId });
  }
});
