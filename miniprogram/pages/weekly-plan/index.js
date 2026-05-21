const { callApi } = require('../../utils/api');
const { getCurrentChildId, setCurrentChildId } = require('../../utils/store');
const { requirePin } = require('../../utils/pin');

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function getWeekStartDate(base = new Date()) {
  const date = new Date(base);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function buildDayTabs(weekStartDate) {
  const labels = ['一', '二', '三', '四', '五', '六', '日'];
  const base = new Date(`${weekStartDate}T00:00:00`);
  return labels.map((label, index) => {
    const current = new Date(base);
    current.setDate(base.getDate() + index);
    return {
      date: formatIsoDate(current),
      label
    };
  });
}

Page({
  data: {
    children: [],
    currentChildId: '',
    weekStartDate: '',
    dayTabs: [],
    activeDay: '',
    taskLibrary: [],
    planDays: {},
    tasks: [],
    customTitle: '',
    customDuration: 10,
    customPoints: 1,
    pinVisible: false,
    pinActionName: ''
  },

  async onShow() {
    const bootstrap = await callApi('bootstrapFamily');
    const childMembers = (bootstrap.members || []).filter((member) => member.isChild);
    const weekStartDate = formatIsoDate(getWeekStartDate());
    const dayTabs = buildDayTabs(weekStartDate);
    const currentChildId = getCurrentChildId() || 'child-younger';
    const result = await callApi('getWeeklyPlan', {
      childId: currentChildId,
      weekStartDate
    });
    this.setData({
      currentChildId: currentChildId || (childMembers[0] && childMembers[0].memberId),
      children: childMembers,
      weekStartDate,
      dayTabs,
      activeDay: this.data.activeDay || dayTabs[0].date,
      taskLibrary: bootstrap.taskLibrary || [],
      planDays: result.days || {},
      tasks: (result.days && result.days[(this.data.activeDay || dayTabs[0].date)]) || []
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
        tasksByDay: this.data.planDays,
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
    this.onShow();
  },

  onTapDay(event) {
    const { date } = event.currentTarget.dataset;
    this.setData({
      activeDay: date,
      tasks: this.data.planDays[date] || []
    });
  },

  onAddTaskFromLibrary(event) {
    const { title } = event.currentTarget.dataset;
    const task = this.data.taskLibrary.find((item) => item.title === title);
    if (!task) {
      return;
    }

    const nextTasks = [...(this.data.planDays[this.data.activeDay] || [])];
    nextTasks.push({
      ...task,
      title: task.title,
      taskType: task.taskType,
      durationMin: task.durationMin,
      points: task.points,
      isRequired: task.isRequired,
      sourceType: 'manual'
    });

    const nextPlanDays = {
      ...this.data.planDays,
      [this.data.activeDay]: nextTasks
    };

    this.setData({
      planDays: nextPlanDays,
      tasks: nextTasks
    });
  },

  onRemoveTask(event) {
    const { index } = event.currentTarget.dataset;
    const nextTasks = [...(this.data.planDays[this.data.activeDay] || [])];
    nextTasks.splice(index, 1);

    const nextPlanDays = {
      ...this.data.planDays,
      [this.data.activeDay]: nextTasks
    };

    this.setData({
      planDays: nextPlanDays,
      tasks: nextTasks
    });
  },

  onCustomTitleInput(event) {
    this.setData({
      customTitle: event.detail.value
    });
  },

  onCustomDurationInput(event) {
    this.setData({
      customDuration: Number(event.detail.value || 0)
    });
  },

  onCustomPointsInput(event) {
    this.setData({
      customPoints: Number(event.detail.value || 0)
    });
  },

  onAddCustomTask() {
    const title = (this.data.customTitle || '').trim();
    if (!title) {
      return;
    }

    const nextTasks = [...(this.data.planDays[this.data.activeDay] || [])];
    nextTasks.push({
      title,
      taskType: 'custom',
      durationMin: this.data.customDuration || 10,
      points: this.data.customPoints || 1,
      isRequired: true,
      sourceType: 'manual'
    });

    const nextPlanDays = {
      ...this.data.planDays,
      [this.data.activeDay]: nextTasks
    };

    this.setData({
      planDays: nextPlanDays,
      tasks: nextTasks,
      customTitle: '',
      customDuration: 10,
      customPoints: 1
    });
  }
});
