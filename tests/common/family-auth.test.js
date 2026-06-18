const {
  buildFamilyId,
  buildFamilyMemberId,
  INVITE_CODE_ALPHABET,
  buildInviteToken,
  resolveActiveMembership,
  requireFamilyMembership,
  verifySensitiveActionAccess
} = require('../../cloudfunctions/api/common/family-auth');

describe('family auth helpers', () => {
  test('builds stable ids from server-side openid inputs', () => {
    expect(buildFamilyId('owner-openid')).toBe('family_owner-openid');
    expect(buildFamilyMemberId({ familyId: 'family-a', openid: 'user-a' })).toBe('family-a_user-a');
  });

  test('builds a six-character uppercase invite code from an unambiguous alphabet', () => {
    const indexes = [0, 1, 30, 31, 7, 8];
    const code = buildInviteToken({
      randomInt: () => indexes.shift()
    });

    expect(INVITE_CODE_ALPHABET).toBe('ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
    expect(code).toBe('AB89HJ');
    expect(code).toMatch(/^[A-Z2-9]{6}$/);
  });

  test('resolves only active memberships for the current openid', () => {
    const membership = resolveActiveMembership({
      openid: 'user-a',
      memberships: [
        { openid: 'user-b', familyId: 'family-b', status: 'active', role: 'guardian' },
        { openid: 'user-a', familyId: 'family-old', status: 'removed', role: 'guardian' },
        { openid: 'user-a', familyId: 'family-a', status: 'active', role: 'owner' }
      ]
    });

    expect(membership).toEqual({
      openid: 'user-a',
      familyId: 'family-a',
      status: 'active',
      role: 'owner'
    });
  });

  test('rejects protected family access without active membership', () => {
    expect(() => {
      requireFamilyMembership({
        openid: 'user-a',
        memberships: [{ openid: 'user-a', familyId: 'family-a', status: 'removed' }]
      });
    }).toThrow('Family membership required');
  });

  test('does not let a correct pin bypass missing membership', () => {
    expect(() => {
      verifySensitiveActionAccess({
        openid: 'outsider',
        memberships: [],
        storedPin: '2468',
        enteredPin: '2468'
      });
    }).toThrow('Family membership required');
  });

  test('accepts sensitive access only when membership and pin are both valid', () => {
    const access = verifySensitiveActionAccess({
      openid: 'owner',
      memberships: [{ openid: 'owner', familyId: 'family-owner', status: 'active', role: 'owner' }],
      storedPin: '2468',
      enteredPin: '2468'
    });

    expect(access.familyId).toBe('family-owner');
    expect(access.role).toBe('owner');
  });
});
