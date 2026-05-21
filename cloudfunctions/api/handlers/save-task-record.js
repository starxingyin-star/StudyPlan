const { buildTaskRecordChange } = require('../common/record-service');

const DEMO_TASKS = {
  'older-reading': {
    dailyTaskId: 'older-reading',
    childId: 'child-older',
    points: 2,
    isRequired: true,
    taskDate: '2026-05-21'
  },
  'older-math': {
    dailyTaskId: 'older-math',
    childId: 'child-older',
    points: 2,
    isRequired: true,
    taskDate: '2026-05-21'
  },
  'older-english': {
    dailyTaskId: 'older-english',
    childId: 'child-older',
    points: 1,
    isRequired: true,
    taskDate: '2026-05-21'
  },
  'younger-writing': {
    dailyTaskId: 'younger-writing',
    childId: 'child-younger',
    points: 2,
    isRequired: true,
    taskDate: '2026-05-21'
  },
  'younger-reading': {
    dailyTaskId: 'younger-reading',
    childId: 'child-younger',
    points: 1,
    isRequired: true,
    taskDate: '2026-05-21'
  }
};

async function saveTaskRecord({ payload }) {
  const task = DEMO_TASKS[payload.dailyTaskId];

  if (!task) {
    throw new Error('Task not found');
  }

  const change = buildTaskRecordChange({
    task,
    result: payload.result,
    comment: payload.comment || '',
    recordedAt: payload.recordedAt || new Date().toISOString(),
    allowLateRecord: Boolean(payload.allowLateRecord),
    memberId: payload.memberId || 'member-grandmother',
    isPausedDay: Boolean(payload.isPausedDay)
  });

  return {
    ok: true,
    taskId: payload.dailyTaskId,
    taskRecord: change.taskRecord,
    pointLedger: change.pointLedger
  };
}

module.exports = {
  saveTaskRecord
};
