const {
  collections,
  DEFAULT_FAMILY_ID,
  ensureDefaultSeed,
  getWeekStartDate
} = require('../common/db');
const { buildWeeklySummary, buildFamilyPk } = require('../common/summary-service');

async function getWeeklyReview({ payload }) {
  await ensureDefaultSeed(collections);

  const childId = payload.childId || 'child-younger';
  const weekStartDate = getWeekStartDate();
  const tasksResult = await collections.dailyTasks.where({
    familyId: DEFAULT_FAMILY_ID,
    childId,
    weeklyPlanId: `${childId}_${weekStartDate}`
  }).get();
  const recordsResult = await collections.taskRecords.where({
    familyId: DEFAULT_FAMILY_ID,
    childId
  }).get();
  const ledgersResult = await collections.pointLedgers.where({
    familyId: DEFAULT_FAMILY_ID,
    childId
  }).get();

  const recordMap = new Map(recordsResult.data.map((record) => [record.dailyTaskId, record]));
  const normalizedRecords = tasksResult.data.map((task) => {
    return recordMap.get(task.dailyTaskId) || {
      result: 'missed',
      pointsAwarded: 0,
      pauseReason: null
    };
  });

  const summary = buildWeeklySummary({
    taskRecords: normalizedRecords,
    pointLedgers: ledgersResult.data
  });

  const membersResult = await collections.members.where({ familyId: DEFAULT_FAMILY_ID, isChild: true }).get();
  const pkSource = [];

  for (const member of membersResult.data) {
    const memberTasks = await collections.dailyTasks.where({
      familyId: DEFAULT_FAMILY_ID,
      childId: member.memberId,
      weeklyPlanId: `${member.memberId}_${weekStartDate}`
    }).get();
    const memberRecords = await collections.taskRecords.where({
      familyId: DEFAULT_FAMILY_ID,
      childId: member.memberId
    }).get();
    const memberLedgers = await collections.pointLedgers.where({
      familyId: DEFAULT_FAMILY_ID,
      childId: member.memberId
    }).get();
    const memberRecordMap = new Map(memberRecords.data.map((record) => [record.dailyTaskId, record]));
    const completed = memberTasks.data.filter((task) => {
      const record = memberRecordMap.get(task.dailyTaskId);
      return record && record.result === 'completed';
    }).length;

    pkSource.push({
      childId: member.memberId,
      childName: member.displayName,
      totalPoints: memberLedgers.data.reduce((sum, item) => sum + item.deltaPoints, 0),
      completionRate: memberTasks.data.length ? completed / memberTasks.data.length : 0,
      streakDays: completed
    });
  }

  const pk = pkSource.length ? buildFamilyPk(pkSource) : null;

  return {
    childId,
    summary,
    pk
  };
}

module.exports = {
  getWeeklyReview
};
