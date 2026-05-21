const { getAwardedPoints } = require('./points');

function isLateRecord(taskDate, recordedAt) {
  const recordedIsoDate = new Date(recordedAt).toISOString().slice(0, 10);
  return recordedIsoDate !== taskDate;
}

function buildTaskRecordChange({
  task,
  result,
  comment,
  recordedAt,
  allowLateRecord,
  memberId,
  isPausedDay = false
}) {
  const lateRecord = isLateRecord(task.taskDate, recordedAt);

  if (lateRecord && !allowLateRecord) {
    throw new Error('Late record is not allowed');
  }

  if (isPausedDay) {
    return {
      taskRecord: {
        dailyTaskId: task.dailyTaskId,
        childId: task.childId,
        taskDate: task.taskDate,
        result: 'missed',
        pointsAwarded: 0,
        comment,
        recordedByMemberId: memberId,
        recordedAt,
        isLateRecord: lateRecord,
        pauseReason: 'paused-day'
      },
      pointLedger: null
    };
  }

  const pointsAwarded = getAwardedPoints({
    result,
    points: task.points
  });

  return {
    taskRecord: {
      dailyTaskId: task.dailyTaskId,
      childId: task.childId,
      taskDate: task.taskDate,
      result,
      pointsAwarded,
      comment,
      recordedByMemberId: memberId,
      recordedAt,
      isLateRecord: lateRecord,
      pauseReason: null
    },
    pointLedger: pointsAwarded
      ? {
          childId: task.childId,
          deltaPoints: pointsAwarded,
          sourceType: 'task_complete',
          relatedTaskId: task.dailyTaskId,
          note: comment || ''
        }
      : null
  };
}

module.exports = {
  buildTaskRecordChange
};
