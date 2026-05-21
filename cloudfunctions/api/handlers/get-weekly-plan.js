const {
  collections,
  DEFAULT_FAMILY_ID,
  DEFAULT_MEMBERS,
  ensureDefaultSeed,
  getWeekStartDate
} = require('../common/db');
const { buildWeeklyPlanDraft } = require('../common/plan-service');

async function getWeeklyPlan({ payload }) {
  await ensureDefaultSeed(collections);

  const childId = payload.childId || 'child-younger';
  const weekStartDate = payload.weekStartDate || getWeekStartDate();
  const weeklyPlanId = `${childId}_${weekStartDate}`;
  let dailyTasksResult = await collections.dailyTasks.where({
    familyId: DEFAULT_FAMILY_ID,
    weeklyPlanId
  }).get();

  if (!dailyTasksResult.data.length) {
    const member = DEFAULT_MEMBERS.find((item) => item.memberId === childId) || DEFAULT_MEMBERS[1];
    const templateId = childId === 'child-older' ? 'older-study-mix' : 'lower-grade-habits';
    const draft = buildWeeklyPlanDraft({
      childId,
      weekStartDate,
      templateId,
      focusHabits: member.focusHabits || []
    });

    for (const [date, tasks] of Object.entries(draft.days)) {
      for (const task of tasks) {
        const taskId = `${weeklyPlanId}_${date}_${task.sortOrder}`;
        await collections.dailyTasks.doc(taskId).set({
          data: {
            ...task,
            dailyTaskId: taskId,
            weeklyPlanId,
            familyId: DEFAULT_FAMILY_ID,
            childId,
            taskDate: date
          }
        });
      }
    }

    dailyTasksResult = await collections.dailyTasks.where({
      familyId: DEFAULT_FAMILY_ID,
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
