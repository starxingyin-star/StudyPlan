const cloud = require('wx-server-sdk');
const { bootstrapFamily } = require('./handlers/bootstrap-family');
const { getToday } = require('./handlers/get-today');
const { getRewards } = require('./handlers/get-rewards');
const { getWeeklyPlan } = require('./handlers/get-weekly-plan');
const { saveWeeklyPlan } = require('./handlers/save-weekly-plan');
const { saveTaskRecord } = require('./handlers/save-task-record');
const { getWeeklyReview } = require('./handlers/get-weekly-review');
const { saveFamilySettings } = require('./handlers/save-family-settings');
const { redeemReward } = require('./handlers/redeem-reward');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const handlers = {
  bootstrapFamily,
  getToday,
  getRewards,
  getWeeklyPlan,
  saveWeeklyPlan,
  saveTaskRecord,
  getWeeklyReview,
  saveFamilySettings,
  redeemReward
};

exports.main = async (event, context) => {
  const { action, payload = {} } = event;
  const handler = handlers[action];

  if (!handler) {
    throw new Error(`Unsupported action: ${action}`);
  }

  return handler({ payload, context });
};
