const cloud = require('wx-server-sdk');
const { buildWeeklyPlanDraft } = require('./plan-service');
const { stripManagedFields } = require('./clean-doc');
const { DEFAULT_REWARD_PRESETS } = require('./templates');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

const DEFAULT_FAMILY_ID = 'family-main';
const DEFAULT_PARENT_PIN = '2468';
const CORE_COLLECTION_NAMES = [
  'families',
  'familyMembers',
  'members',
  'weeklyPlans',
  'dailyTasks',
  'taskRecords',
  'rewardRules',
  'pointLedgers',
  'rewardRedemptions'
];

const DEFAULT_MEMBERS = [
  {
    memberId: 'child-older',
    displayName: '姐姐',
    isChild: true,
    relationType: 'child',
    grade: '四年级',
    focusHabits: ['阅读', '口算']
  },
  {
    memberId: 'child-younger',
    displayName: '弟弟',
    isChild: true,
    relationType: 'child',
    grade: '二年级',
    focusHabits: ['练字', '朗读']
  },
  {
    memberId: 'member-father',
    displayName: '爸爸',
    isChild: false,
    relationType: 'father'
  },
  {
    memberId: 'member-grandmother',
    displayName: '奶奶',
    isChild: false,
    relationType: 'grandmother'
  }
];

function toDayId(date) {
  return date.toISOString().slice(0, 10);
}

function getWeekStartDate(base = new Date()) {
  const date = new Date(base);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toDayId(date);
}

async function getDocOrNull(collection, id) {
  try {
    const result = await collection.doc(id).get();
    return result.data;
  } catch (error) {
    return null;
  }
}

async function getDocsByQuery(collection, query) {
  try {
    const result = await collection.where(query).get();
    return result.data || [];
  } catch (error) {
    if (isMissingCollectionError(error)) {
      return [];
    }
    throw error;
  }
}

function isCollectionAlreadyExistsError(error) {
  const message = `${error && (error.message || error.errMsg) || ''}`;
  return error && (
    error.code === 'DATABASE_COLLECTION_ALREADY_EXISTS' ||
    message.includes('already exists') ||
    message.includes('already exist')
  );
}

async function createCollectionFor(collection) {
  const create = collection && (collection.createCollection || collection.ensureCollection);
  if (!create) {
    throw new Error(`Missing collection cannot be created automatically: ${collection && collection.collectionName || 'unknown'}`);
  }

  try {
    await create.call(collection);
  } catch (error) {
    if (!isCollectionAlreadyExistsError(error)) {
      throw error;
    }
  }
}

async function setDoc(collection, id, data) {
  const cleaned = stripManagedFields(data);
  try {
    await collection.doc(id).set({ data: cleaned });
  } catch (error) {
    if (!isMissingCollectionError(error)) {
      throw error;
    }

    await createCollectionFor(collection);
    await collection.doc(id).set({ data: cleaned });
  }
  return cleaned;
}

function isMissingCollectionError(error) {
  const message = `${error && (error.message || error.errMsg) || ''}`;
  return error && (
    error.code === 'DATABASE_COLLECTION_NOT_EXIST' ||
    error.errCode === -502005 ||
    message.includes('collection not exists') ||
    message.includes('Db or Table not exist')
  );
}

async function ensureCoreCollections(database = db, names = CORE_COLLECTION_NAMES) {
  await Promise.all(names.map(async (name) => {
    try {
      await database.collection(name).where({}).limit(1).get();
    } catch (error) {
      if (!isMissingCollectionError(error)) {
        throw error;
      }

      await database.createCollection(name);
    }
  }));
}

function buildScopedId(familyId, id) {
  return `${familyId}_${id}`;
}

async function ensureFamilySeed(collections, familyId = DEFAULT_FAMILY_ID, options = {}) {
  const existingFamily = await getDocOrNull(collections.families, familyId);
  const family = existingFamily || await setDoc(collections.families, familyId, {
      familyId,
      familyName: options.familyName || '我们一家',
      parentPin: options.parentPin || DEFAULT_PARENT_PIN,
      pkEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

  const existingMembers = await getDocsByQuery(collections.members, { familyId });
  const existingRewards = await getDocsByQuery(collections.rewardRules, { familyId });

  if (!existingMembers.length) {
    for (const member of DEFAULT_MEMBERS) {
      const memberId = buildScopedId(familyId, member.memberId);
      await setDoc(collections.members, memberId, {
        ...member,
        familyId,
        memberId,
        isActive: true
      });
    }
  }

  if (!existingRewards.length) {
    for (const [index, reward] of DEFAULT_REWARD_PRESETS.entries()) {
      const rewardRuleId = buildScopedId(familyId, `reward-${index + 1}`);
      await setDoc(collections.rewardRules, rewardRuleId, {
        rewardRuleId,
        familyId,
        scopeType: 'family',
        childId: '',
        enabled: true,
        sortOrder: index + 1,
        ...reward
      });
    }
  }

  const existingWeeklyPlans = await getDocsByQuery(collections.weeklyPlans, { familyId });
  if (existingWeeklyPlans.length) {
    return family;
  }

  const currentWeek = options.currentWeekStartDate || getWeekStartDate();
  const drafts = [
    buildWeeklyPlanDraft({
      childId: buildScopedId(familyId, 'child-older'),
      weekStartDate: currentWeek,
      templateId: 'older-study-mix',
      focusHabits: ['阅读', '口算']
    }),
    buildWeeklyPlanDraft({
      childId: buildScopedId(familyId, 'child-younger'),
      weekStartDate: currentWeek,
      templateId: 'lower-grade-habits',
      focusHabits: ['练字', '朗读']
    })
  ];

  for (const draft of drafts) {
    const weeklyPlanId = buildScopedId(familyId, `${draft.childId}_${draft.weekStartDate}`);
    await setDoc(collections.weeklyPlans, weeklyPlanId, {
      weeklyPlanId,
      familyId,
      childId: draft.childId,
      weekStartDate: draft.weekStartDate,
      templateId: draft.templateId,
      status: 'active',
      focusHabits: draft.focusHabits,
      copiedFromWeeklyPlanId: ''
    });

    for (const [date, tasks] of Object.entries(draft.days)) {
      for (const task of tasks) {
        const taskId = buildScopedId(familyId, `${weeklyPlanId}_${date}_${task.sortOrder}`);
        await setDoc(collections.dailyTasks, taskId, {
          ...task,
          dailyTaskId: taskId,
          weeklyPlanId,
          familyId,
          childId: draft.childId,
          taskDate: date
        });
      }
    }
  }

  return family;
}

async function ensureDefaultSeed(collections) {
  return ensureFamilySeed(collections, DEFAULT_FAMILY_ID);
}

async function withMissingCollectionReadFallback(operation) {
  try {
    return await operation();
  } catch (error) {
    if (isMissingCollectionError(error)) {
      return { data: [] };
    }
    throw error;
  }
}

async function withMissingCollectionWriteRetry(collection, operation) {
  try {
    return await operation();
  } catch (error) {
    if (!isMissingCollectionError(error)) {
      throw error;
    }

    await createCollectionFor(collection);
    return operation();
  }
}

async function withMissingCollectionRemoveFallback(operation) {
  try {
    return await operation();
  } catch (error) {
    if (isMissingCollectionError(error)) {
      return { stats: { removed: 0 } };
    }
    throw error;
  }
}

function collectionWithCreate(name, database = db) {
  const source = database.collection(name);
  const collection = {
    collectionName: name,
    createCollection: () => database.createCollection(name),
    doc(id) {
      const sourceDoc = source.doc(id);
      return {
        get() {
          return sourceDoc.get();
        },
        set(options) {
          return withMissingCollectionWriteRetry(collection, () => source.doc(id).set(options));
        },
        remove() {
          return withMissingCollectionRemoveFallback(() => source.doc(id).remove());
        }
      };
    },
    where(query) {
      const sourceQuery = source.where(query);
      return {
        get() {
          return withMissingCollectionReadFallback(() => source.where(query).get());
        },
        remove() {
          return withMissingCollectionRemoveFallback(() => source.where(query).remove());
        },
        limit(count) {
          const limitedQuery = sourceQuery.limit(count);
          return {
            get() {
              return withMissingCollectionReadFallback(() => limitedQuery.get());
            }
          };
        }
      };
    },
    add(options) {
      return withMissingCollectionWriteRetry(collection, () => source.add(options));
    }
  };

  return collection;
}

module.exports = {
  cloud,
  db,
  _,
  DEFAULT_FAMILY_ID,
  DEFAULT_PARENT_PIN,
  DEFAULT_MEMBERS,
  CORE_COLLECTION_NAMES,
  buildScopedId,
  getWeekStartDate,
  getDocOrNull,
  getDocsByQuery,
  setDoc,
  isMissingCollectionError,
  collectionWithCreate,
  ensureCoreCollections,
  ensureFamilySeed,
  ensureDefaultSeed,
  collections: {
    families: collectionWithCreate('families'),
    familyMembers: collectionWithCreate('familyMembers'),
    members: collectionWithCreate('members'),
    weeklyPlans: collectionWithCreate('weeklyPlans'),
    dailyTasks: collectionWithCreate('dailyTasks'),
    taskRecords: collectionWithCreate('taskRecords'),
    rewardRules: collectionWithCreate('rewardRules'),
    pointLedgers: collectionWithCreate('pointLedgers'),
    rewardRedemptions: collectionWithCreate('rewardRedemptions')
  }
};
