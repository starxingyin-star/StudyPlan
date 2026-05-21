Page({
  goToWeeklyPlan() {
    wx.navigateTo({ url: '/pages/weekly-plan/index' });
  },

  goToWeeklyReview() {
    wx.navigateTo({ url: '/pages/weekly-review/index' });
  },

  goToFamily() {
    wx.navigateTo({ url: '/pages/family/index' });
  }
});
