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
const { createFamily } = require('./handlers/create-family');
const { createFamilyInvite } = require('./handlers/create-family-invite');
const { joinFamily } = require('./handlers/join-family');
const dbCommon = require('./common/db');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const API_VERSION = 'family-auth-20260618-1535';

const handlers = {
  bootstrapFamily,
  getToday,
  getRewards,
  getWeeklyPlan,
  saveWeeklyPlan,
  saveTaskRecord,
  getWeeklyReview,
  saveFamilySettings,
  redeemReward,
  createFamily,
  createFamilyInvite,
  joinFamily
};

async function ensureCoreCollections() {
  return dbCommon.ensureCoreCollections();
}

function getDiagnostics() {
  return {
    ok: true,
    version: API_VERSION,
    supportedActions: Object.keys(handlers).sort()
  };
}

exports.main = async (event, context) => {
  const { action, payload = {} } = event;
  const wxContext = cloud.getWXContext ? cloud.getWXContext() : {};

  if (action === 'diagnostics') {
    return getDiagnostics();
  }

  const handler = handlers[action];

  if (!handler) {
    throw new Error(`Unsupported action: ${action}; apiVersion=${API_VERSION}; supported=${Object.keys(handlers).sort().join(',')}`);
  }

  return handler({
    payload,
    context,
    authContext: {
      openid: wxContext.OPENID || ''
    }
  });
};

module.exports.getDiagnostics = getDiagnostics;
module.exports.handlers = handlers;
module.exports.ensureCoreCollections = ensureCoreCollections;
module.exports.main = exports.main;
