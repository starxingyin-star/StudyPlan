const { collections, DEFAULT_FAMILY_ID, ensureDefaultSeed, getDocOrNull, setDoc } = require('../common/db');
const { buildTaskRecordChange } = require('../common/record-service');

async function saveTaskRecord({ payload }) {
  await ensureDefaultSeed(collections);

  const task = await getDocOrNull(collections.dailyTasks, payload.dailyTaskId);

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

  const taskRecordId = `${task.dailyTaskId}_${task.taskDate}`;
  await setDoc(collections.taskRecords, taskRecordId, {
    ...change.taskRecord,
    taskRecordId,
    familyId: DEFAULT_FAMILY_ID
  });

  const pointLedgerId = `task_${task.dailyTaskId}_${task.taskDate}`;
  if (change.pointLedger) {
    await setDoc(collections.pointLedgers, pointLedgerId, {
      ...change.pointLedger,
      pointLedgerId,
      familyId: DEFAULT_FAMILY_ID,
      createdAt: new Date().toISOString()
    });
  } else {
    try {
      await collections.pointLedgers.doc(pointLedgerId).remove();
    } catch (error) {
      // ignore absent ledgers
    }
  }

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
