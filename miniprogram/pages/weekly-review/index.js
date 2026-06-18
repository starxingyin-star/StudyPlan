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
    if (bootstrap.needsFamilySetup) {
      wx.switchTab({ url: '/pages/mine/index' });
      return;
    }
    const childMembers = (bootstrap.members || []).filter((member) => member.isChild);
    const storedChildId = getCurrentChildId();
    const currentChildId = childMembers.some((member) => member.memberId === storedChildId)
      ? storedChildId
      : (childMembers[0] && childMembers[0].memberId);
    if (currentChildId) {
      setCurrentChildId(currentChildId);
    }
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
