const { verifyPin } = require('./pin-service');
const crypto = require('crypto');

const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITE_CODE_LENGTH = 6;

function normalizeIdPart(value) {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '');
}

function buildFamilyId(openid) {
  const suffix = normalizeIdPart(openid);
  if (!suffix) {
    throw new Error('OpenID required');
  }
  return `family_${suffix}`;
}

function buildFamilyMemberId({ familyId, openid }) {
  return `${normalizeIdPart(familyId)}_${normalizeIdPart(openid)}`;
}

function buildInviteToken({ randomInt } = {}) {
  const pickIndex = randomInt || ((max) => crypto.randomInt(max));
  let token = '';

  for (let index = 0; index < INVITE_CODE_LENGTH; index += 1) {
    token += INVITE_CODE_ALPHABET[pickIndex(INVITE_CODE_ALPHABET.length)];
  }

  return token;
}

function resolveActiveMembership({ openid, memberships = [] }) {
  if (!openid) {
    return null;
  }

  return memberships.find((membership) => {
    return membership.openid === openid && membership.status === 'active' && membership.familyId;
  }) || null;
}

function requireFamilyMembership({ openid, memberships = [] }) {
  const membership = resolveActiveMembership({ openid, memberships });
  if (!membership) {
    throw new Error('Family membership required');
  }
  return membership;
}

function verifySensitiveActionAccess({ openid, memberships = [], storedPin, enteredPin }) {
  const membership = requireFamilyMembership({ openid, memberships });
  if (!verifyPin({ storedPin, enteredPin })) {
    throw new Error('Invalid PIN');
  }
  return membership;
}

module.exports = {
  INVITE_CODE_ALPHABET,
  INVITE_CODE_LENGTH,
  buildFamilyId,
  buildFamilyMemberId,
  buildInviteToken,
  resolveActiveMembership,
  requireFamilyMembership,
  verifySensitiveActionAccess
};
