const { buildScopedId, collections, ensureFamilySeed, getDocOrNull, setDoc } = require('../common/db');
const { resolveFamilyAuth } = require('../common/family-service');
const { buildTaskRecordChange } = require('../common/record-service');

async function saveTaskRecord({ payload, authContext }) {
  const auth = await resolveFamilyAuth({
    collections,
    openid: authContext && authContext.openid
  });
  await ensureFamilySeed(collections, auth.familyId, {
    familyName: auth.family.familyName,
    parentPin: auth.family.parentPin
  });

  const task = await getDocOrNull(collections.dailyTasks, payload.dailyTaskId);

  if (!task || task.familyId !== auth.familyId) {
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

  const taskRecordId = buildScopedId(auth.familyId, `${task.dailyTaskId}_${task.taskDate}`);
  await setDoc(collections.taskRecords, taskRecordId, {
    ...change.taskRecord,
    taskRecordId,
    familyId: auth.familyId
  });

  const pointLedgerId = buildScopedId(auth.familyId, `task_${task.dailyTaskId}_${task.taskDate}`);
  if (change.pointLedger) {
    await setDoc(collections.pointLedgers, pointLedgerId, {
      ...change.pointLedger,
      pointLedgerId,
      familyId: auth.familyId,
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
