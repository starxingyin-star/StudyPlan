function callApi(action, payload = {}) {
  return wx.cloud.callFunction({
    name: 'api',
    data: {
      action,
      payload
    }
  }).then((response) => response.result);
}

module.exports = {
  callApi
};
