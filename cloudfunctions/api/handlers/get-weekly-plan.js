const {
  collections,
  DEFAULT_FAMILY_ID,
  ensureDefaultSeed,
  getWeekStartDate
} = require('../common/db');

async function getWeeklyPlan({ payload }) {
  await ensureDefaultSeed(collections);

  const childId = payload.childId || 'child-younger';
  const weekStartDate = payload.weekStartDate || getWeekStartDate();
  const weeklyPlanId = `${childId}_${weekStartDate}`;
  const dailyTasksResult = await collections.dailyTasks.where({
    familyId: DEFAULT_FAMILY_ID,
    weeklyPlanId
  }).get();

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
