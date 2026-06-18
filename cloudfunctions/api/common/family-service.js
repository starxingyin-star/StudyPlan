const {
  buildFamilyId,
  buildFamilyMemberId,
  buildInviteToken,
  requireFamilyMembership,
  resolveActiveMembership
} = require('./family-auth');
const { getDocOrNull, getDocsByQuery, setDoc } = require('./db');

const INVITE_EXPIRES_IN_MS = 72 * 60 * 60 * 1000;
const MAX_INVITE_TOKEN_ATTEMPTS = 10;

function normalizeInviteToken(token) {
  return String(token || '').trim().toUpperCase();
}

function buildInviteExpiresAt(now) {
  return new Date(new Date(now).getTime() + INVITE_EXPIRES_IN_MS).toISOString();
}

function isInviteUnexpired(family, now) {
  if (!family.currentInviteExpiresAt) {
    return true;
  }
  return new Date(family.currentInviteExpiresAt).getTime() > new Date(now).getTime();
}

async function findActiveInviteFamilies(collections, token, now) {
  const families = await getDocsByQuery(collections.families, {
    currentInviteToken: token,
    currentInviteStatus: 'active'
  });
  return families.filter((family) => isInviteUnexpired(family, now));
}

async function resolveFamilyAuth({ collections, openid, required = true }) {
  const memberships = await getDocsByQuery(collections.familyMembers, { openid });
  const member = resolveActiveMembership({ openid, memberships });

  if (!member) {
    if (!required) {
      return null;
    }
    requireFamilyMembership({ openid, memberships });
  }

  const family = await getDocOrNull(collections.families, member.familyId);
  if (!family) {
    throw new Error('Family not found');
  }

  return {
    openid,
    familyId: member.familyId,
    role: member.role || 'guardian',
    member,
    family
  };
}

async function createFamilyForOpenid({
  collections,
  openid,
  familyName = '我们一家',
  parentPin = '2468',
  now = new Date().toISOString()
}) {
  if (!openid) {
    throw new Error('OpenID required');
  }

  const existing = await resolveFamilyAuth({ collections, openid, required: false });
  if (existing) {
    return existing;
  }

  const familyId = buildFamilyId(openid);
  const family = await setDoc(collections.families, familyId, {
    familyId,
    familyName: familyName || '我们一家',
    parentPin: parentPin || '2468',
    pkEnabled: true,
    createdAt: now,
    updatedAt: now
  });

  const member = await setDoc(collections.familyMembers, buildFamilyMemberId({ familyId, openid }), {
    familyMemberId: buildFamilyMemberId({ familyId, openid }),
    familyId,
    openid,
    role: 'owner',
    status: 'active',
    joinedAt: now,
    updatedAt: now
  });

  return {
    openid,
    familyId,
    role: 'owner',
    family,
    member
  };
}

async function createFamilyInvite({
  collections,
  auth,
  now = new Date().toISOString(),
  generateInviteToken = buildInviteToken
}) {
  if (!auth || !auth.familyId) {
    throw new Error('Family membership required');
  }

  const family = await getDocOrNull(collections.families, auth.familyId);
  if (!family) {
    throw new Error('Family not found');
  }

  let token = '';
  for (let attempt = 0; attempt < MAX_INVITE_TOKEN_ATTEMPTS; attempt += 1) {
    const candidate = normalizeInviteToken(generateInviteToken());
    const activeFamilies = await findActiveInviteFamilies(collections, candidate, now);
    const collidesWithOtherFamily = activeFamilies.some((item) => item.familyId !== auth.familyId);

    if (!collidesWithOtherFamily) {
      token = candidate;
      break;
    }
  }

  if (!token) {
    throw new Error('Unable to generate invite code');
  }

  await setDoc(collections.families, auth.familyId, {
    ...family,
    currentInviteToken: token,
    currentInviteStatus: 'active',
    currentInviteExpiresAt: buildInviteExpiresAt(now),
    inviteCreatedByOpenid: auth.openid || auth.member && auth.member.openid || '',
    inviteCreatedAt: now,
    updatedAt: now
  });

  return {
    token,
    familyId: auth.familyId,
    createdByOpenid: auth.openid || auth.member && auth.member.openid || '',
    status: 'active',
    createdAt: now,
    updatedAt: now
  };
}

async function joinFamilyByInvite({ collections, openid, token, now = new Date().toISOString() }) {
  if (!openid) {
    throw new Error('OpenID required');
  }
  const normalizedToken = normalizeInviteToken(token);
  if (!normalizedToken) {
    throw new Error('Invite token required');
  }

  const families = await findActiveInviteFamilies(collections, normalizedToken, now);
  const uniqueFamilyIds = new Set(families.map((family) => family.familyId).filter(Boolean));
  if (uniqueFamilyIds.size !== 1) {
    throw new Error('Invalid invite');
  }

  const inviteFamily = families.find((family) => family.familyId === [...uniqueFamilyIds][0]) || null;
  if (!inviteFamily || !inviteFamily.familyId) {
    throw new Error('Invalid invite');
  }

  const familyMemberId = buildFamilyMemberId({ familyId: inviteFamily.familyId, openid });
  const member = await setDoc(collections.familyMembers, familyMemberId, {
    familyMemberId,
    familyId: inviteFamily.familyId,
    openid,
    role: 'guardian',
    status: 'active',
    joinedAt: now,
    updatedAt: now
  });

  return {
    openid,
    familyId: inviteFamily.familyId,
    role: member.role,
    family: inviteFamily,
    member
  };
}

module.exports = {
  createFamilyForOpenid,
  createFamilyInvite,
  joinFamilyByInvite,
  resolveFamilyAuth
};
