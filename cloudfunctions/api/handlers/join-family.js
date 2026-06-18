const { collections, ensureFamilySeed } = require('../common/db');
const { joinFamilyByInvite } = require('../common/family-service');

async function joinFamily({ payload, authContext, collections: injectedCollections }) {
  const activeCollections = injectedCollections || collections;
  const auth = await joinFamilyByInvite({
    collections: activeCollections,
    openid: authContext && authContext.openid,
    token: payload.token
  });

  await ensureFamilySeed(activeCollections, auth.familyId, {
    familyName: auth.family.familyName,
    parentPin: auth.family.parentPin
  });

  return {
    ok: true,
    family: auth.family,
    member: auth.member
  };
}

module.exports = {
  joinFamily
};
