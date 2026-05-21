const {
  buildTaskRecordChange
} = require('../../cloudfunctions/api/common/record-service');

describe('record service', () => {
  test('awards points for completed tasks and marks late records', () => {
    const change = buildTaskRecordChange({
      task: { dailyTaskId: 'task-1', childId: 'child-1', points: 2, isRequired: true, taskDate: '2026-05-21' },
      result: 'completed',
      comment: '今天状态不错',
      recordedAt: '2026-05-22T08:00:00.000Z',
      allowLateRecord: true,
      memberId: 'member-1'
    });

    expect(change.taskRecord.pointsAwarded).toBe(2);
    expect(change.taskRecord.isLateRecord).toBe(true);
    expect(change.pointLedger.deltaPoints).toBe(2);
  });

  test('preserves streak when a day is paused', () => {
    const change = buildTaskRecordChange({
      task: { dailyTaskId: 'task-2', childId: 'child-1', points: 2, isRequired: true, taskDate: '2026-05-21' },
      result: 'missed',
      comment: '生病休息',
      recordedAt: '2026-05-21T12:00:00.000Z',
      allowLateRecord: false,
      memberId: 'member-1',
      isPausedDay: true
    });

    expect(change.taskRecord.pauseReason).toBe('paused-day');
    expect(change.pointLedger).toBeNull();
  });
});
