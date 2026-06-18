const {
  createFamilyForOpenid,
  createFamilyInvite,
  joinFamilyByInvite,
  resolveFamilyAuth
} = require('../../cloudfunctions/api/common/family-service');

function matchesQuery(item, query) {
  return Object.entries(query).every(([key, value]) => item[key] === value);
}

function createMemoryCollection() {
  const docs = new Map();

  return {
    docs,
    doc(id) {
      return {
        async get() {
          if (!docs.has(id)) {
            throw new Error('not found');
          }
          return { data: docs.get(id) };
        },
        async set({ data }) {
          docs.set(id, data);
        },
        async remove() {
          docs.delete(id);
        }
      };
    },
    where(query) {
      return {
        async get() {
          return {
            data: [...docs.values()].filter((item) => matchesQuery(item, query))
          };
        },
        async remove() {
          for (const [id, item] of docs.entries()) {
            if (matchesQuery(item, query)) {
              docs.delete(id);
            }
          }
        }
      };
    },
    async add({ data }) {
      const id = `auto-${docs.size + 1}`;
      docs.set(id, data);
      return { _id: id };
    }
  };
}

function createCollections() {
  return {
    families: createMemoryCollection(),
    familyMembers: createMemoryCollection()
  };
}

describe('family service', () => {
  test('returns setup state when openid has no active family membership', async () => {
    const auth = await resolveFamilyAuth({
      collections: createCollections(),
      openid: 'new-user',
      required: false
    });

    expect(auth).toBe(null);
  });

  test('creates a family owned by the current openid', async () => {
    const collections = createCollections();

    const result = await createFamilyForOpenid({
      collections,
      openid: 'owner-openid',
      familyName: '测试家庭',
      parentPin: '1357',
      now: '2026-06-17T12:00:00.000Z'
    });

    expect(result.family.familyId).toBe('family_owner-openid');
    expect(result.member).toMatchObject({
      familyId: 'family_owner-openid',
      openid: 'owner-openid',
      role: 'owner',
      status: 'active'
    });

    const auth = await resolveFamilyAuth({
      collections,
      openid: 'owner-openid'
    });
    expect(auth.familyId).toBe('family_owner-openid');
    expect(auth.family.familyName).toBe('测试家庭');
  });

  test('allows another openid to join with an active six-character invite code', async () => {
    const collections = createCollections();
    const owner = await createFamilyForOpenid({
      collections,
      openid: 'owner-openid',
      familyName: '测试家庭',
      parentPin: '1357',
      now: '2026-06-17T12:00:00.000Z'
    });
    const invite = await createFamilyInvite({
      collections,
      auth: owner.member,
      generateInviteToken: () => 'AB89HJ',
      now: '2026-06-17T12:01:00.000Z'
    });

    const joined = await joinFamilyByInvite({
      collections,
      openid: 'grandma-openid',
      token: invite.token,
      now: '2026-06-17T12:02:00.000Z'
    });

    expect(joined.member).toMatchObject({
      familyId: 'family_owner-openid',
      openid: 'grandma-openid',
      role: 'guardian',
      status: 'active'
    });
  });

  test('stores invite state on the family document without requiring a separate invite collection', async () => {
    const collections = createCollections();
    const owner = await createFamilyForOpenid({
      collections,
      openid: 'owner-openid',
      familyName: '测试家庭',
      parentPin: '1357',
      now: '2026-06-17T12:00:00.000Z'
    });

    const invite = await createFamilyInvite({
      collections,
      auth: owner,
      generateInviteToken: () => 'CD2345',
      now: '2026-06-17T12:03:00.000Z'
    });
    const family = await collections.families.doc(owner.familyId).get();

    expect(invite.token).toBe('CD2345');
    expect(family.data.currentInviteToken).toBe(invite.token);
    expect(family.data.currentInviteStatus).toBe('active');
    expect(family.data.currentInviteExpiresAt).toBe('2026-06-20T12:03:00.000Z');
  });

  test('retries when a generated invite code is already active for another family', async () => {
    const collections = createCollections();
    await collections.families.doc('family-existing').set({
      data: {
        familyId: 'family-existing',
        familyName: '已有家庭',
        currentInviteToken: 'AB89HJ',
        currentInviteStatus: 'active',
        currentInviteExpiresAt: '2026-06-18T12:00:00.000Z'
      }
    });
    const owner = await createFamilyForOpenid({
      collections,
      openid: 'owner-openid',
      familyName: '测试家庭',
      parentPin: '1357',
      now: '2026-06-17T12:00:00.000Z'
    });
    const generated = ['AB89HJ', 'CD2345'];

    const invite = await createFamilyInvite({
      collections,
      auth: owner,
      generateInviteToken: () => generated.shift(),
      now: '2026-06-17T12:03:00.000Z'
    });

    expect(invite.token).toBe('CD2345');
  });

  test('rejects an expired invite code', async () => {
    const collections = createCollections();
    await collections.families.doc('family-a').set({
      data: {
        familyId: 'family-a',
        familyName: 'A 的家庭',
        currentInviteToken: 'AB89HJ',
        currentInviteStatus: 'active',
        currentInviteExpiresAt: '2026-06-17T12:00:00.000Z'
      }
    });

    await expect(joinFamilyByInvite({
      collections,
      openid: 'grandma-openid',
      token: 'AB89HJ',
      now: '2026-06-18T12:00:00.000Z'
    })).rejects.toThrow('Invalid invite');
  });

  test('rejects an ambiguous invite code instead of joining the wrong family', async () => {
    const collections = createCollections();
    await collections.families.doc('family-a').set({
      data: {
        familyId: 'family-a',
        familyName: 'A 的家庭',
        currentInviteToken: 'AB89HJ',
        currentInviteStatus: 'active',
        currentInviteExpiresAt: '2026-06-20T12:00:00.000Z'
      }
    });
    await collections.families.doc('family-b').set({
      data: {
        familyId: 'family-b',
        familyName: 'B 的家庭',
        currentInviteToken: 'AB89HJ',
        currentInviteStatus: 'active',
        currentInviteExpiresAt: '2026-06-20T12:00:00.000Z'
      }
    });

    await expect(joinFamilyByInvite({
      collections,
      openid: 'grandma-openid',
      token: 'AB89HJ',
      now: '2026-06-18T12:00:00.000Z'
    })).rejects.toThrow('Invalid invite');
  });

  test('does not write cloud-managed family fields back when creating an invite', async () => {
    const collections = createCollections();
    await collections.families.doc('family-a').set({
      data: {
        _id: 'cloud-doc-id',
        _openid: 'creator-openid',
        familyId: 'family-a',
        familyName: 'A 的家庭',
        parentPin: '2468'
      }
    });
    await collections.familyMembers.doc('family-a_owner-openid').set({
      data: {
        familyMemberId: 'family-a_owner-openid',
        familyId: 'family-a',
        openid: 'owner-openid',
        role: 'owner',
        status: 'active'
      }
    });

    await createFamilyInvite({
      collections,
      auth: await resolveFamilyAuth({
        collections,
        openid: 'owner-openid'
      }),
      generateInviteToken: () => 'EF6789',
      now: '2026-06-17T12:04:00.000Z'
    });
    const family = await collections.families.doc('family-a').get();

    expect(family.data).not.toHaveProperty('_id');
    expect(family.data).not.toHaveProperty('_openid');
    expect(family.data.currentInviteToken).toBe('EF6789');
  });
});
