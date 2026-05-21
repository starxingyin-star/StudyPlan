const { callApi } = require('../../utils/api');
const { getCurrentChildId, setCurrentChildId } = require('../../utils/store');

Page({
  data: {
    children: [],
    currentChildId: '',
    summary: {
      totalTasks: 0,
      completedTasks: 0,
      streakDays: 0,
      totalPoints: 0
    },
    tasks: []
  },

  async onShow() {
    const currentChildId = getCurrentChildId();
    const result = await callApi('getToday', { childId: currentChildId });

    this.setData({
      currentChildId,
      summary: result.summary || this.data.summary,
      tasks: result.tasks || []
    });
  },

  onChildChange(event) {
    const { childId } = event.detail;
    setCurrentChildId(childId);
    this.setData({ currentChildId: childId });
    this.onShow();
  }
});
