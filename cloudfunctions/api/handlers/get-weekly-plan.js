const {
  buildScopedId,
  collections,
  DEFAULT_MEMBERS,
  ensureFamilySeed,
  getWeekStartDate
} = require('../common/db');
const { resolveFamilyAuth } = require('../common/family-service');
const { resolveChildId } = require('../common/member-service');
const { buildWeeklyPlanDraft } = require('../common/plan-service');

async function getWeeklyPlan({ payload, authContext }) {
  const auth = await resolveFamilyAuth({
    collections,
    openid: authContext && authContext.openid
  });
  await ensureFamilySeed(collections, auth.familyId, {
    familyName: auth.family.familyName,
    parentPin: auth.family.parentPin
  });

  const childId = await resolveChildId({
    collections,
    familyId: auth.familyId,
    requestedChildId: payload.childId
  });
  const weekStartDate = payload.weekStartDate || getWeekStartDate();
  const weeklyPlanId = buildScopedId(auth.familyId, `${childId}_${weekStartDate}`);
  let dailyTasksResult = await collections.dailyTasks.where({
    familyId: auth.familyId,
    weeklyPlanId
  }).get();

  if (!dailyTasksResult.data.length) {
    const membersResult = await collections.members.where({ familyId: auth.familyId, memberId: childId }).get();
    const member = membersResult.data[0] || DEFAULT_MEMBERS[1];
    const templateId = (member.focusHabits || []).includes('口算') ? 'older-study-mix' : 'lower-grade-habits';
    const draft = buildWeeklyPlanDraft({
      childId,
      weekStartDate,
      templateId,
      focusHabits: member.focusHabits || []
    });

    for (const [date, tasks] of Object.entries(draft.days)) {
      for (const task of tasks) {
        const taskId = buildScopedId(auth.familyId, `${weeklyPlanId}_${date}_${task.sortOrder}`);
        await collections.dailyTasks.doc(taskId).set({
          data: {
            ...task,
            dailyTaskId: taskId,
            weeklyPlanId,
            familyId: auth.familyId,
            childId,
            taskDate: date
          }
        });
      }
    }

    dailyTasksResult = await collections.dailyTasks.where({
      familyId: auth.familyId,
      weeklyPlanId
    }).get();
  }

  const days = {};
  for (const task of dailyTasksResult.data) {
    if (!days[task.taskDate]) {
      days[task.taskDate] = [];
    }
    days[task.taskDate].push(task);
  }

  for (const tasks of Object.values(days)) {
    tasks.sort((left, right) => left.sortOrder - right.sortOrder);
  }

  return {
    childId,
    weekStartDate,
    days
  };
}

module.exports = {
  getWeeklyPlan
};
