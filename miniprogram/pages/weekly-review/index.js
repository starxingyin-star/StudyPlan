const { callApi } = require('../../utils/api');
const { getCurrentChildId } = require('../../utils/store');

Page({
  data: {
    currentChildId: '',
    summary: null,
    pk: null
  },

  async onShow() {
    const currentChildId = getCurrentChildId();
    const result = await callApi('getWeeklyReview', { childId: currentChildId });

    this.setData({
      currentChildId,
      summary: result.summary,
      pk: result.pk
    });
  }
});
