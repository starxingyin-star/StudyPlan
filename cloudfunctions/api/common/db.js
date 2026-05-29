const cloud = require('wx-server-sdk');
const { buildWeeklyPlanDraft } = require('./plan-service');
const { stripManagedFields } = require('./clean-doc');
const { DEFAULT_REWARD_PRESETS } = require('./templates');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

const DEFAULT_FAMILY_ID = 'family-main';
const DEFAULT_PARENT_PIN = '2468';

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

async function setDoc(collection, id, data) {
  const cleaned = stripManagedFields(data);
  await collection.doc(id).set({ data: cleaned });
  return cleaned;
}

async function ensureDefaultSeed(collections) {
  const existingFamily = await getDocOrNull(collections.families, DEFAULT_FAMILY_ID);
  if (existingFamily) {
    return existingFamily;
  }

  const family = await setDoc(collections.families, DEFAULT_FAMILY_ID, {
    familyId: DEFAULT_FAMILY_ID,
    familyName: '我们一家',
    parentPin: DEFAULT_PARENT_PIN,
    pkEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  for (const member of DEFAULT_MEMBERS) {
    await setDoc(collections.members, member.memberId, {
      familyId: DEFAULT_FAMILY_ID,
      isActive: true,
      ...member
    });
  }

  for (const [index, reward] of DEFAULT_REWARD_PRESETS.entries()) {
    const rewardRuleId = `reward-${index + 1}`;
    await setDoc(collections.rewardRules, rewardRuleId, {
      rewardRuleId,
      familyId: DEFAULT_FAMILY_ID,
      scopeType: 'family',
      childId: '',
      enabled: true,
      sortOrder: index + 1,
      ...reward
    });
  }

  const currentWeek = getWeekStartDate();
  const drafts = [
    buildWeeklyPlanDraft({
      childId: 'child-older',
      weekStartDate: currentWeek,
      templateId: 'older-study-mix',
      focusHabits: ['阅读', '口算']
    }),
    buildWeeklyPlanDraft({
      childId: 'child-younger',
      weekStartDate: currentWeek,
      templateId: 'lower-grade-habits',
      focusHabits: ['练字', '朗读']
    })
  ];

  for (const draft of drafts) {
    const weeklyPlanId = `${draft.childId}_${draft.weekStartDate}`;
    await setDoc(collections.weeklyPlans, weeklyPlanId, {
      weeklyPlanId,
      familyId: DEFAULT_FAMILY_ID,
      childId: draft.childId,
      weekStartDate: draft.weekStartDate,
      templateId: draft.templateId,
      status: 'active',
      focusHabits: draft.focusHabits,
      copiedFromWeeklyPlanId: ''
    });

    for (const [date, tasks] of Object.entries(draft.days)) {
      for (const task of tasks) {
        const taskId = `${weeklyPlanId}_${date}_${task.sortOrder}`;
        await setDoc(collections.dailyTasks, taskId, {
          ...task,
          dailyTaskId: taskId,
          weeklyPlanId,
          familyId: DEFAULT_FAMILY_ID,
          childId: draft.childId,
          taskDate: date
        });
      }
    }
  }

  return family;
}

module.exports = {
  cloud,
  db,
  _,
  DEFAULT_FAMILY_ID,
  DEFAULT_PARENT_PIN,
  DEFAULT_MEMBERS,
  getWeekStartDate,
  getDocOrNull,
  setDoc,
  ensureDefaultSeed,
  collections: {
    families: db.collection('families'),
    members: db.collection('members'),
    weeklyPlans: db.collection('weeklyPlans'),
    dailyTasks: db.collection('dailyTasks'),
    taskRecords: db.collection('taskRecords'),
    rewardRules: db.collection('rewardRules'),
    pointLedgers: db.collection('pointLedgers'),
    rewardRedemptions: db.collection('rewardRedemptions')
  }
};
