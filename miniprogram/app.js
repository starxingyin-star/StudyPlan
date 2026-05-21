App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('wx.cloud is required');
      return;
    }

    wx.cloud.init({
      traceUser: true
    });
  }
});
