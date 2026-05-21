Page({
  data: {
    overview: {
      familyName: '我们一家',
      childCount: 2,
      rewardCount: 4
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },

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
