const { collections, DEFAULT_FAMILY_ID, ensureDefaultSeed } = require('../common/db');
const { DEFAULT_TASK_LIBRARY } = require('../common/templates');

async function bootstrapFamily() {
  const family = await ensureDefaultSeed(collections);
  const membersResult = await collections.members.where({ familyId: DEFAULT_FAMILY_ID }).get();
  const rewardsResult = await collections.rewardRules.where({ familyId: DEFAULT_FAMILY_ID }).get();

  return {
    family,
    members: membersResult.data,
    rewardPresets: rewardsResult.data,
    taskLibrary: DEFAULT_TASK_LIBRARY
  };
}

module.exports = {
  bootstrapFamily
};
