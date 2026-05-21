const { verifyPin } = require('../common/pin-service');
const { buildWeeklyPlanDraft } = require('../common/plan-service');

async function saveWeeklyPlan({ payload }) {
  if (!verifyPin({ storedPin: '2468', enteredPin: payload.pin })) {
    throw new Error('Invalid PIN');
  }

  const draft = buildWeeklyPlanDraft({
    childId: payload.childId,
    weekStartDate: payload.weekStartDate || '2026-05-25',
    templateId: payload.templateId || 'lower-grade-habits',
    focusHabits: payload.focusHabits || ['练字', '朗读']
  });

  return {
    ok: true,
    childId: payload.childId,
    weekStartDate: draft.weekStartDate,
    days: draft.days
  };
}

module.exports = {
  saveWeeklyPlan
};
