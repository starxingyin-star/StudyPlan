const { callApi } = require('../../utils/api');
const { getCurrentChildId, setCurrentChildId } = require('../../utils/store');

Page({
  data: {
    children: [],
    currentChildId: '',
    summary: null,
    pk: null
  },

  async onShow() {
    const bootstrap = await callApi('bootstrapFamily');
    const childMembers = (bootstrap.members || []).filter((member) => member.isChild);
    const currentChildId = getCurrentChildId() || (childMembers[0] && childMembers[0].memberId);
    const result = await callApi('getWeeklyReview', { childId: currentChildId });

    this.setData({
      children: childMembers,
      currentChildId,
      summary: result.summary,
      pk: result.pk
    });
  },

  onChildChange(event) {
    const { childId } = event.detail;
    setCurrentChildId(childId);
    this.setData({ currentChildId: childId });
    this.onShow();
  }
});
