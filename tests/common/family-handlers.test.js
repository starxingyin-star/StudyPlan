const { bootstrapFamily } = require('../../cloudfunctions/api/handlers/bootstrap-family');
const { createFamilyInvite } = require('../../cloudfunctions/api/handlers/create-family-invite');
const { getToday } = require('../../cloudfunctions/api/handlers/get-today');

function createMemoryCollection() {
  const docs = new Map();

  return {
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
          const data = [...docs.values()].filter((item) => {
            return Object.entries(query).every(([key, value]) => item[key] === value);
          });
          return { data };
        },
        async remove() {
          for (const [id, item] of docs.entries()) {
            if (Object.entries(query).every(([key, value]) => item[key] === value)) {
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
    familyMembers: createMemoryCollection(),
    members: createMemoryCollection(),
    rewardRules: createMemoryCollection(),
    weeklyPlans: createMemoryCollection(),
    dailyTasks: createMemoryCollection(),
    taskRecords: createMemoryCollection(),
    pointLedgers: createMemoryCollection()
  };
}

describe('family auth handlers', () => {
  test('api entrypoint does not run core collection preflight before family actions', async () => {
    const api = require('../../cloudfunctions/api/index');
    const calls = [];
    const originalEnsureCoreCollections = api.ensureCoreCollections;
    const originalHandlers = { ...api.handlers };

    api.ensureCoreCollections = async () => {
      calls.push('ensure');
    };
    api.handlers.bootstrapFamily = async () => {
      calls.push('handler');
      return { ok: true };
    };

    const result = await api.main({ action: 'bootstrapFamily' }, {});

    expect(result).toEqual({ ok: true });
    expect(calls).toEqual(['handler']);

    api.ensureCoreCollections = originalEnsureCoreCollections;
    Object.assign(api.handlers, originalHandlers);
  });

  test('api entrypoint keeps warm calls free of core collection preflight', async () => {
    const api = require('../../cloudfunctions/api/index');
    const calls = [];
    const originalEnsureCoreCollections = api.ensureCoreCollections;
    const originalHandlers = { ...api.handlers };

    api.ensureCoreCollections = async () => {
      calls.push('ensure');
    };
    api.handlers.bootstrapFamily = async () => {
      calls.push('handler');
      return { ok: true };
    };

    await api.main({ action: 'bootstrapFamily' }, {});
    await api.main({ action: 'bootstrapFamily' }, {});

    expect(calls).toEqual(['handler', 'handler']);

    api.ensureCoreCollections = originalEnsureCoreCollections;
    Object.assign(api.handlers, originalHandlers);
  });

  test('api diagnostics exposes deployed version and supported family actions', async () => {
    const { getDiagnostics } = require('../../cloudfunctions/api/index');

    const result = getDiagnostics();

    expect(result.version).toMatch(/^family-auth-/);
    expect(result.supportedActions).toContain('createFamilyInvite');
    expect(result.supportedActions).toContain('joinFamily');
  });

  test('bootstrap handler returns setup state when caller has no family membership', async () => {
    const result = await bootstrapFamily({
      collections: createCollections(),
      authContext: {
        openid: 'no-family-openid'
      }
    });

    expect(result.needsFamilySetup).toBe(true);
    expect(result.family).toBe(null);
    expect(result.members).toEqual([]);
    expect(result.rewardPresets).toEqual([]);
  });

  test('does not expose family data to another openid that opens a shared mini program link', async () => {
    const collections = createCollections();
    await collections.families.doc('family-a').set({
      data: {
        familyId: 'family-a',
        familyName: 'A 的家庭',
        parentPin: '2468'
      }
    });
    await collections.familyMembers.doc('family-a_openid-a').set({
      data: {
        familyMemberId: 'family-a_openid-a',
        familyId: 'family-a',
        openid: 'openid-a',
        role: 'owner',
        status: 'active'
      }
    });
    await collections.members.doc('family-a_child').set({
      data: {
        familyId: 'family-a',
        memberId: 'family-a_child',
        displayName: 'A 的孩子',
        isChild: true
      }
    });
    await collections.dailyTasks.doc('family-a_task').set({
      data: {
        familyId: 'family-a',
        dailyTaskId: 'family-a_task',
        childId: 'family-a_child',
        taskDate: new Date().toISOString().slice(0, 10),
        title: 'A 的任务',
        sortOrder: 1
      }
    });

    const sharedBootstrap = await bootstrapFamily({
      collections,
      authContext: {
        openid: 'openid-b'
      }
    });

    expect(sharedBootstrap.needsFamilySetup).toBe(true);
    expect(sharedBootstrap.family).toBe(null);
    expect(sharedBootstrap.members).toEqual([]);

    await expect(getToday({
      collections,
      authContext: {
        openid: 'openid-b'
      },
      payload: {
        childId: 'family-a_child'
      }
    })).rejects.toThrow('Family membership required');
  });

  test('create invite handler returns a six-character token for an active family member', async () => {
    const collections = createCollections();
    await collections.families.doc('family-a').set({
      data: {
        familyId: 'family-a',
        familyName: 'A 的家庭',
        parentPin: '2468'
      }
    });
    await collections.familyMembers.doc('family-a_openid-a').set({
      data: {
        familyMemberId: 'family-a_openid-a',
        familyId: 'family-a',
        openid: 'openid-a',
        role: 'owner',
        status: 'active'
      }
    });

    const result = await createFamilyInvite({
      collections,
      authContext: {
        openid: 'openid-a'
      }
    });
    const family = await collections.families.doc('family-a').get();

    expect(result.ok).toBe(true);
    expect(result.token).toMatch(/^[A-Z2-9]{6}$/);
    expect(family.data.currentInviteToken).toBe(result.token);
    expect(family.data.currentInviteExpiresAt).toBeTruthy();
  });
});
