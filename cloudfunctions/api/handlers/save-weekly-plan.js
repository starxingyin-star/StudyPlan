const {
  collections,
  DEFAULT_FAMILY_ID,
  getDocOrNull,
  setDoc
} = require('../common/db');
const { buildWeeklyPlanDraft } = require('../common/plan-service');
const { verifyPin } = require('../common/pin-service');

async function saveWeeklyPlan({ payload }) {
  const family = await getDocOrNull(collections.families, DEFAULT_FAMILY_ID);

  if (!verifyPin({ storedPin: family ? family.parentPin : '2468', enteredPin: payload.pin })) {
    throw new Error('Invalid PIN');
  }

  const draft = buildWeeklyPlanDraft({
    childId: payload.childId,
    weekStartDate: payload.weekStartDate || '2026-05-25',
    templateId: payload.templateId || 'lower-grade-habits',
    focusHabits: payload.focusHabits || ['练字', '朗读']
  });

  const weeklyPlanId = `${draft.childId}_${draft.weekStartDate}`;

  await setDoc(collections.weeklyPlans, weeklyPlanId, {
    weeklyPlanId,
    familyId: DEFAULT_FAMILY_ID,
    childId: draft.childId,
    weekStartDate: draft.weekStartDate,
    templateId: draft.templateId,
    status: 'active',
    focusHabits: draft.focusHabits,
    copiedFromWeeklyPlanId: ''
  });

  try {
    await collections.dailyTasks.where({
      familyId: DEFAULT_FAMILY_ID,
      weeklyPlanId
    }).remove();
  } catch (error) {
    // ignore remove failures when no existing tasks are present
  }

  const persistedDays = {};

  for (const [date, tasks] of Object.entries(draft.days)) {
    persistedDays[date] = [];
    for (const task of tasks) {
      const taskId = `${weeklyPlanId}_${date}_${task.sortOrder}`;
      const nextTask = {
        ...task,
        dailyTaskId: taskId,
        weeklyPlanId,
        familyId: DEFAULT_FAMILY_ID,
        childId: draft.childId,
        taskDate: date
      };
      await setDoc(collections.dailyTasks, taskId, nextTask);
      persistedDays[date].push(nextTask);
    }
  }

  return {
    ok: true,
    childId: payload.childId,
    weekStartDate: draft.weekStartDate,
    days: persistedDays
  };
}

module.exports = {
  saveWeeklyPlan
};
