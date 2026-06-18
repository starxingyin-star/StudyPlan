function enableShareMenu() {
  if (!wx || !wx.showShareMenu) {
    return;
  }

  wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage']
  });
}

function getShareAppMessage() {
  return {
    title: '乐学日程',
    path: '/pages/today/index'
  };
}

module.exports = {
  enableShareMenu,
  getShareAppMessage
};
