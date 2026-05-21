const CURRENT_CHILD_KEY = 'currentChildId';

function getCurrentChildId() {
  return wx.getStorageSync(CURRENT_CHILD_KEY) || '';
}

function setCurrentChildId(childId) {
  wx.setStorageSync(CURRENT_CHILD_KEY, childId);
}

module.exports = {
  CURRENT_CHILD_KEY,
  getCurrentChildId,
  setCurrentChildId
};
