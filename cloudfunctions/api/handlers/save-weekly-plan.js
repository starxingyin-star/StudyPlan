const {
  buildScopedId,
  collections,
  getDocOrNull,
  setDoc
} = require('../common/db');
const { resolveFamilyAuth } = require('../common/family-service');
const { resolveChildId } = require('../common/member-service');
const { buildWeeklyPlanDraft } = require('../common/plan-service');
const { verifyPin } = require('../common/pin-service');

async function saveWeeklyPlan({ payload, authContext }) {
  const auth = await resolveFamilyAuth({
    collections,
    openid: authContext && authContext.openid
  });
  const family = await getDocOrNull(collections.families, auth.familyId);

  if (!verifyPin({ storedPin: family ? family.parentPin : '2468', enteredPin: payload.pin })) {
    throw new Error('Invalid PIN');
  }

  const childId = await resolveChildId({
    collections,
    familyId: auth.familyId,
    requestedChildId: payload.childId
  });

  const draft = buildWeeklyPlanDraft({
    childId,
    weekStartDate: payload.weekStartDate || '2026-05-25',
    templateId: payload.templateId || 'lower-grade-habits',
    focusHabits: payload.focusHabits || ['练字', '朗读'],
    tasksByDay: payload.tasksByDay || {}
  });

  const weeklyPlanId = buildScopedId(auth.familyId, `${draft.childId}_${draft.weekStartDate}`);

  await setDoc(collections.weeklyPlans, weeklyPlanId, {
    weeklyPlanId,
    familyId: auth.familyId,
    childId: draft.childId,
    weekStartDate: draft.weekStartDate,
    templateId: draft.templateId,
    status: 'active',
    focusHabits: draft.focusHabits,
    copiedFromWeeklyPlanId: ''
  });

  try {
    await collections.dailyTasks.where({
      familyId: auth.familyId,
      weeklyPlanId
    }).remove();
  } catch (error) {
    // ignore remove failures when no existing tasks are present
  }

  const persistedDays = {};

  for (const [date, tasks] of Object.entries(draft.days)) {
    persistedDays[date] = [];
    for (const task of tasks) {
      const taskId = buildScopedId(auth.familyId, `${weeklyPlanId}_${date}_${task.sortOrder}`);
      const nextTask = {
        ...task,
        dailyTaskId: taskId,
        weeklyPlanId,
        familyId: auth.familyId,
        childId: draft.childId,
        taskDate: date
      };
      await setDoc(collections.dailyTasks, taskId, nextTask);
      persistedDays[date].push(nextTask);
    }
  }

  return {
    ok: true,
    childId,
    weekStartDate: draft.weekStartDate,
    days: persistedDays
  };
}

module.exports = {
  saveWeeklyPlan
};
