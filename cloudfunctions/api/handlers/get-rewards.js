const { buildScopedId, collections, ensureFamilySeed, getWeekStartDate } = require('../common/db');
const { resolveFamilyAuth } = require('../common/family-service');
const { resolveChildId } = require('../common/member-service');
const { buildFamilyPk } = require('../common/summary-service');

async function getRewards({ payload, authContext }) {
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
  const rewardsResult = await collections.rewardRules.where({ familyId: auth.familyId }).get();
  const ledgersResult = await collections.pointLedgers.where({ familyId: auth.familyId, childId }).get();
  const redemptionsResult = await collections.rewardRedemptions.where({ familyId: auth.familyId, childId }).get();
  const balance = ledgersResult.data.reduce((sum, item) => sum + item.deltaPoints, 0);
  const membersResult = await collections.members.where({ familyId: auth.familyId, isChild: true }).get();
  const weekStartDate = getWeekStartDate();
  const pkSource = [];

  for (const member of membersResult.data) {
    const weeklyPlanId = buildScopedId(auth.familyId, `${member.memberId}_${weekStartDate}`);
    const tasks = await collections.dailyTasks.where({
      familyId: auth.familyId,
      childId: member.memberId,
      weeklyPlanId
    }).get();
    const records = await collections.taskRecords.where({
      familyId: auth.familyId,
      childId: member.memberId
    }).get();
    const memberLedgers = await collections.pointLedgers.where({
      familyId: auth.familyId,
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
    pk,
    recentRedemptions: redemptionsResult.data
      .sort((left, right) => String(right.requestedAt || '').localeCompare(String(left.requestedAt || '')))
      .slice(0, 5)
  };
}

module.exports = {
  getRewards
};
