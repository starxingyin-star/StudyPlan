const { collections, DEFAULT_FAMILY_ID, ensureDefaultSeed } = require('../common/db');

async function getToday({ payload }) {
  await ensureDefaultSeed(collections);

  const childId = payload.childId || 'child-younger';
  const today = new Date().toISOString().slice(0, 10);
  const tasksResult = await collections.dailyTasks.where({
    familyId: DEFAULT_FAMILY_ID,
    childId,
    taskDate: today
  }).get();
  const recordsResult = await collections.taskRecords.where({
    familyId: DEFAULT_FAMILY_ID,
    childId,
    taskDate: today
  }).get();
  const ledgersResult = await collections.pointLedgers.where({
    familyId: DEFAULT_FAMILY_ID,
    childId
  }).get();

  const completedTasks = recordsResult.data.filter((record) => record.result === 'completed').length;
  const totalPoints = ledgersResult.data.reduce((sum, item) => sum + item.deltaPoints, 0);
  const recordMap = new Map(recordsResult.data.map((record) => [record.dailyTaskId, record]));
  const tasks = tasksResult.data
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((task) => {
      const record = recordMap.get(task.dailyTaskId);
      return {
        ...task,
        currentResult: record ? record.result : '',
        currentComment: record ? record.comment : '',
        isPausedDay: Boolean(record && record.pauseReason === 'paused-day')
      };
    });

  return {
    childId,
    tasks,
    summary: {
      totalTasks: tasks.length,
      completedTasks,
      streakDays: 0,
      totalPoints
    }
  };
}

module.exports = {
  getToday
};
