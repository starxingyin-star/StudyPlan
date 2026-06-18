const {
  collections,
  buildScopedId,
  ensureFamilySeed,
  getWeekStartDate
} = require('../common/db');
const { resolveFamilyAuth } = require('../common/family-service');
const { resolveChildId } = require('../common/member-service');
const { buildWeeklySummary, buildFamilyPk } = require('../common/summary-service');

async function getWeeklyReview({ payload, authContext }) {
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
  const weekStartDate = getWeekStartDate();
  const weeklyPlanId = buildScopedId(auth.familyId, `${childId}_${weekStartDate}`);
  const tasksResult = await collections.dailyTasks.where({
    familyId: auth.familyId,
    childId,
    weeklyPlanId
  }).get();
  const recordsResult = await collections.taskRecords.where({
    familyId: auth.familyId,
    childId
  }).get();
  const ledgersResult = await collections.pointLedgers.where({
    familyId: auth.familyId,
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

  const membersResult = await collections.members.where({ familyId: auth.familyId, isChild: true }).get();
  const pkSource = [];

  for (const member of membersResult.data) {
    const memberWeeklyPlanId = buildScopedId(auth.familyId, `${member.memberId}_${weekStartDate}`);
    const memberTasks = await collections.dailyTasks.where({
      familyId: auth.familyId,
      childId: member.memberId,
      weeklyPlanId: memberWeeklyPlanId
    }).get();
    const memberRecords = await collections.taskRecords.where({
      familyId: auth.familyId,
      childId: member.memberId
    }).get();
    const memberLedgers = await collections.pointLedgers.where({
      familyId: auth.familyId,
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
