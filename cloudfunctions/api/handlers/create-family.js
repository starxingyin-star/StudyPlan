const { collections, ensureFamilySeed } = require('../common/db');
const { createFamilyForOpenid } = require('../common/family-service');

async function createFamily({ payload, authContext, collections: injectedCollections }) {
  const activeCollections = injectedCollections || collections;
  const auth = await createFamilyForOpenid({
    collections: activeCollections,
    openid: authContext && authContext.openid,
    familyName: payload.familyName || '我们一家',
    parentPin: payload.parentPin || '2468'
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
  createFamily
};
