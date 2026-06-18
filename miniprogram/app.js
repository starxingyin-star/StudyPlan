App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('wx.cloud is required');
      return;
    }

    wx.cloud.init({
      env: 'cloud1-d7g7yii2b9c8c0665',
      traceUser: true
    });
  }
});
