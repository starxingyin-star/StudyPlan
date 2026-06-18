const { collections, ensureFamilySeed } = require('../common/db');
const { resolveFamilyAuth } = require('../common/family-service');
const { resolveChildId } = require('../common/member-service');

async function getToday({ payload, authContext, collections: injectedCollections }) {
  const activeCollections = injectedCollections || collections;
  const auth = await resolveFamilyAuth({
    collections: activeCollections,
    openid: authContext && authContext.openid
  });
  await ensureFamilySeed(activeCollections, auth.familyId, {
    familyName: auth.family.familyName,
    parentPin: auth.family.parentPin
  });

  const childId = await resolveChildId({
    collections: activeCollections,
    familyId: auth.familyId,
    requestedChildId: payload.childId
  });
  const today = new Date().toISOString().slice(0, 10);
  const tasksResult = await activeCollections.dailyTasks.where({
    familyId: auth.familyId,
    childId,
    taskDate: today
  }).get();
  const recordsResult = await activeCollections.taskRecords.where({
    familyId: auth.familyId,
    childId,
    taskDate: today
  }).get();
  const ledgersResult = await activeCollections.pointLedgers.where({
    familyId: auth.familyId,
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
