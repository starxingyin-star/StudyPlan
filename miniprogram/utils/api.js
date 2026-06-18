function callApi(action, payload = {}) {
  return wx.cloud.callFunction({
    name: 'api',
    data: {
      action,
      payload
    }
  }).then((response) => response.result).catch((error) => {
    const message = error && (error.errMsg || error.message);
    throw new Error(message || '请求失败');
  });
}

module.exports = {
  callApi
};
