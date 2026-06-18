function requirePin(page, actionName) {
  return new Promise((resolve, reject) => {
    page._pinResolve = resolve;
    page._pinReject = reject;
    page.setData({
      pinActionName: actionName,
      pinVisible: true
    });
  });
}

module.exports = {
  requirePin
};
