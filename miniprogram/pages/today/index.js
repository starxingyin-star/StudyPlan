const { callApi } = require('../../utils/api');
const { getCurrentChildId, setCurrentChildId } = require('../../utils/store');

Page({
  data: {
    familyName: '',
    children: [],
    currentChildId: 'child-younger',
    currentChildName: '',
    summary: {
      totalTasks: 0,
      completedTasks: 0,
      streakDays: 0,
      totalPoints: 0
    },
    tasks: [],
    expandedTaskId: '',
    noteDrafts: {},
    completionPercent: 0,
    encouragement: '',
    remainingTasks: 0
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    this.loadPage();
  },

  async loadPage() {
    const bootstrap = await callApi('bootstrapFamily');
    const childMembers = (bootstrap.members || []).filter((member) => member.isChild);
    const currentChildId = getCurrentChildId() || this.data.currentChildId || (childMembers[0] && childMembers[0].memberId);
    const result = await callApi('getToday', { childId: currentChildId });
    const currentChild = childMembers.find((member) => member.memberId === currentChildId) || childMembers[0] || {};
    const summary = result.summary || this.data.summary;
    const completionPercent = summary.totalTasks ? Math.round((summary.completedTasks / summary.totalTasks) * 100) : 0;
    const remainingTasks = Math.max((summary.totalTasks || 0) - (summary.completedTasks || 0), 0);
    let encouragement = '先完成一项，拿到今天的第一分。';
    if (completionPercent === 100 && summary.totalTasks) {
      encouragement = '今天任务已经完成，可以去奖励页看看能兑换什么。';
    } else if (completionPercent >= 50) {
      encouragement = '已经过半，再坚持一下就能完成今天目标。';
    } else if (summary.totalTasks === 0) {
      encouragement = '今天还没有任务，先去本周计划里安排一下。';
    }

    this.setData({
      currentChildId,
      currentChildName: currentChild.displayName || '',
      familyName: bootstrap.family ? bootstrap.family.familyName : '我们一家',
      children: childMembers,
      summary,
      tasks: result.tasks || [],
      completionPercent,
      encouragement,
      remainingTasks
    });
  },

  onChildChange(event) {
    const { childId } = event.detail;
    setCurrentChildId(childId);
    this.setData({ currentChildId: childId });
    this.loadPage();
  },

  onToggleTask(event) {
    const { taskId } = event.currentTarget.dataset;
    this.setData({
      expandedTaskId: this.data.expandedTaskId === taskId ? '' : taskId
    });
  },

  onNoteInput(event) {
    const { taskId } = event.currentTarget.dataset;
    const noteDrafts = {
      ...this.data.noteDrafts,
      [taskId]: event.detail.value
    };
    this.setData({ noteDrafts });
  },

  async onRecordTask(event) {
    const { taskId, result, paused } = event.currentTarget.dataset;
    const comment = this.data.noteDrafts[taskId] || '';
    await callApi('saveTaskRecord', {
      dailyTaskId: taskId,
      result,
      isPausedDay: Boolean(paused),
      comment
    });
    await this.loadPage();
    this.setData({
      expandedTaskId: '',
      noteDrafts: {
        ...this.data.noteDrafts,
        [taskId]: ''
      }
    });
  }
});
