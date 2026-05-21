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
    const bootstrap = await callApi('bootstrapFamily');
    const childMembers = (bootstrap.members || []).filter((member) => member.isChild);
    const currentChildId = getCurrentChildId() || this.data.currentChildId || (childMembers[0] && childMembers[0].memberId);
    const result = await callApi('getToday', { childId: currentChildId });

    this.setData({
      currentChildId,
      children: childMembers,
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
    await callApi('saveTaskRecord', {
      dailyTaskId: taskId,
      result: 'completed',
      comment: '已完成'
    });
    await this.onShow();
  }
});
