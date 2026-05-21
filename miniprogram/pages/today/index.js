const { callApi } = require('../../utils/api');
const { getCurrentChildId, setCurrentChildId } = require('../../utils/store');

Page({
  data: {
    children: [],
    currentChildId: 'child-younger',
    summary: {
      totalTasks: 0,
      completedTasks: 0,
      streakDays: 0,
      totalPoints: 0
    },
    tasks: []
  },

  async onShow() {
    const currentChildId = getCurrentChildId() || this.data.currentChildId;
    const result = await callApi('getToday', { childId: currentChildId });

    this.setData({
      currentChildId,
      children: [
        { memberId: 'child-older', displayName: '姐姐' },
        { memberId: 'child-younger', displayName: '弟弟' }
      ],
      summary: result.summary || this.data.summary,
      tasks: result.tasks || []
    });
  },

  onChildChange(event) {
    const { childId } = event.detail;
    setCurrentChildId(childId);
    this.setData({ currentChildId: childId });
    this.onShow();
  },

  async onTapComplete(event) {
    const { taskId } = event.currentTarget.dataset;
    const result = await callApi('saveTaskRecord', {
      dailyTaskId: taskId,
      result: 'completed',
      comment: '已完成'
    });
    const added = result.pointLedger ? result.pointLedger.deltaPoints : 0;

    this.setData({
      summary: {
        ...this.data.summary,
        completedTasks: this.data.summary.completedTasks + 1,
        totalPoints: this.data.summary.totalPoints + added
      }
    });
  }
});
