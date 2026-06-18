const { ensureFamilySeed } = require('../../cloudfunctions/api/common/db');

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
        }
      };
    },
    where(query) {
      return {
        async get() {
          return {
            data: [...docs.values()].filter((item) => matchesQuery(item, query))
          };
        }
      };
    }
  };
}

function createCollections() {
  return {
    families: createMemoryCollection(),
    members: createMemoryCollection(),
    rewardRules: createMemoryCollection(),
    weeklyPlans: createMemoryCollection(),
    dailyTasks: createMemoryCollection()
  };
}

describe('family seeding', () => {
  test('fills default members and rewards even when the family document already exists', async () => {
    const collections = createCollections();
    await collections.families.doc('family-a').set({
      data: {
        familyId: 'family-a',
        familyName: 'A 的家庭',
        parentPin: '2468'
      }
    });

    const family = await ensureFamilySeed(collections, 'family-a');
    const members = await collections.members.where({ familyId: 'family-a' }).get();
    const rewards = await collections.rewardRules.where({ familyId: 'family-a' }).get();

    expect(family.familyName).toBe('A 的家庭');
    expect(members.data.filter((member) => member.isChild)).toHaveLength(2);
    expect(rewards.data.length).toBeGreaterThan(0);
    expect(members.data.every((member) => member.memberId.startsWith('family-a_'))).toBe(true);
  });

  test('does not overwrite an existing weekly plan during later bootstrap calls', async () => {
    const collections = createCollections();
    await collections.families.doc('family-a').set({
      data: {
        familyId: 'family-a',
        familyName: 'A 的家庭',
        parentPin: '2468'
      }
    });
    await collections.weeklyPlans.doc('custom-plan').set({
      data: {
        weeklyPlanId: 'custom-plan',
        familyId: 'family-a',
        childId: 'family-a_child-custom',
        weekStartDate: '2026-06-15',
        templateId: 'custom-template'
      }
    });

    await ensureFamilySeed(collections, 'family-a', {
      currentWeekStartDate: '2026-06-15'
    });

    const plans = await collections.weeklyPlans.where({ familyId: 'family-a' }).get();
    expect(plans.data).toHaveLength(1);
    expect(plans.data[0]).toMatchObject({
      weeklyPlanId: 'custom-plan',
      templateId: 'custom-template'
    });
  });
});
