const { collections } = require('../common/db');
const { createFamilyInvite, resolveFamilyAuth } = require('../common/family-service');

async function createFamilyInviteHandler({ authContext, collections: injectedCollections }) {
  const activeCollections = injectedCollections || collections;
  const auth = await resolveFamilyAuth({
    collections: activeCollections,
    openid: authContext && authContext.openid
  });
  const invite = await createFamilyInvite({ collections: activeCollections, auth });

  return {
    ok: true,
    token: invite.token,
    familyId: invite.familyId
  };
}

module.exports = {
  createFamilyInvite: createFamilyInviteHandler
};
