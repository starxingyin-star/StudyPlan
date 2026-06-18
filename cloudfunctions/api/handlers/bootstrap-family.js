const { collections, ensureFamilySeed } = require('../common/db');
const { resolveFamilyAuth } = require('../common/family-service');
const { DEFAULT_TASK_LIBRARY } = require('../common/templates');

async function bootstrapFamily({ authContext, collections: injectedCollections }) {
  const activeCollections = injectedCollections || collections;
  const auth = await resolveFamilyAuth({
    collections: activeCollections,
    openid: authContext && authContext.openid,
    required: false
  });

  if (!auth) {
    return {
      needsFamilySetup: true,
      family: null,
      members: [],
      rewardPresets: [],
      taskLibrary: DEFAULT_TASK_LIBRARY
    };
  }

  const family = await ensureFamilySeed(activeCollections, auth.familyId, {
    familyName: auth.family.familyName,
    parentPin: auth.family.parentPin
  });
  const membersResult = await activeCollections.members.where({ familyId: auth.familyId }).get();
  const rewardsResult = await activeCollections.rewardRules.where({ familyId: auth.familyId }).get();

  return {
    needsFamilySetup: false,
    family,
    members: membersResult.data,
    rewardPresets: rewardsResult.data,
    taskLibrary: DEFAULT_TASK_LIBRARY
  };
}

module.exports = {
  bootstrapFamily
};
