const { collections, DEFAULT_FAMILY_ID, ensureDefaultSeed, getWeekStartDate } = require('../common/db');
const { buildFamilyPk } = require('../common/summary-service');

async function getRewards({ payload }) {
  await ensureDefaultSeed(collections);

  const childId = payload.childId || 'child-younger';
  const rewardsResult = await collections.rewardRules.where({ familyId: DEFAULT_FAMILY_ID }).get();
  const ledgersResult = await collections.pointLedgers.where({ familyId: DEFAULT_FAMILY_ID, childId }).get();
  const balance = ledgersResult.data.reduce((sum, item) => sum + item.deltaPoints, 0);
  const membersResult = await collections.members.where({ familyId: DEFAULT_FAMILY_ID, isChild: true }).get();
  const weekStartDate = getWeekStartDate();
  const pkSource = [];

  for (const member of membersResult.data) {
    const tasks = await collections.dailyTasks.where({
      familyId: DEFAULT_FAMILY_ID,
      childId: member.memberId,
      weeklyPlanId: `${member.memberId}_${weekStartDate}`
    }).get();
    const records = await collections.taskRecords.where({
      familyId: DEFAULT_FAMILY_ID,
      childId: member.memberId
    }).get();
    const memberLedgers = await collections.pointLedgers.where({
      familyId: DEFAULT_FAMILY_ID,
      childId: member.memberId
    }).get();

    const completed = records.data.filter((record) => record.result === 'completed').length;
    pkSource.push({
      childId: member.memberId,
      childName: member.displayName,
      totalPoints: memberLedgers.data.reduce((sum, item) => sum + item.deltaPoints, 0),
      completionRate: tasks.data.length ? completed / tasks.data.length : 0,
      streakDays: completed
    });
  }

  const pk = pkSource.length ? buildFamilyPk(pkSource) : null;

  return {
    childId,
    balance,
    rewards: rewardsResult.data
      .filter((reward) => reward.scopeType === 'family' || reward.childId === childId)
      .sort((left, right) => left.sortOrder - right.sortOrder),
    pk
  };
}

module.exports = {
  getRewards
};
