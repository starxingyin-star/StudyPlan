const { callApi } = require('../../utils/api');
const { getCurrentChildId, setCurrentChildId } = require('../../utils/store');
const { requirePin } = require('../../utils/pin');

Page({
  data: {
    children: [],
    currentChildId: '',
    weekStartDate: '2026-05-25',
    dayTabs: [
      { date: '2026-05-25', label: '一' },
      { date: '2026-05-26', label: '二' },
      { date: '2026-05-27', label: '三' },
      { date: '2026-05-28', label: '四' },
      { date: '2026-05-29', label: '五' }
    ],
    activeDay: '2026-05-25',
    planDays: {},
    tasks: [],
    pinVisible: false,
    pinActionName: ''
  },

  onShow() {
    const currentChildId = getCurrentChildId();
    this.setData({
      currentChildId: currentChildId || 'child-younger',
      children: [
        { memberId: 'child-older', displayName: '姐姐' },
        { memberId: 'child-younger', displayName: '弟弟' }
      ]
    });
  },

  async onTapSavePlan() {
    try {
      const pin = await requirePin(this, '保存本周计划');
      const result = await callApi('saveWeeklyPlan', {
        childId: this.data.currentChildId,
        weekStartDate: this.data.weekStartDate,
        templateId: 'lower-grade-habits',
        focusHabits: ['练字', '朗读'],
        pin
      });
      this.setData({
        pinVisible: false,
        planDays: result.days,
        tasks: result.days[this.data.activeDay] || []
      });
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
  },

  onTapDay(event) {
    const { date } = event.currentTarget.dataset;
    this.setData({
      activeDay: date,
      tasks: this.data.planDays[date] || []
    });
  }
});
