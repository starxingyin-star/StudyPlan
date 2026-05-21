const {
  buildWeeklySummary,
  buildFamilyPk
} = require('../../cloudfunctions/api/common/summary-service');

describe('weekly summaries and PK', () => {
  test('computes summary metrics from task records and ledgers', () => {
    const summary = buildWeeklySummary({
      taskRecords: [
        { result: 'completed', pointsAwarded: 2, pauseReason: null },
        { result: 'completed', pointsAwarded: 1, pauseReason: null },
        { result: 'missed', pointsAwarded: 0, pauseReason: null }
      ],
      pointLedgers: [{ deltaPoints: 2 }, { deltaPoints: 1 }]
    });

    expect(summary.totalPoints).toBe(3);
    expect(summary.completedCount).toBe(2);
    expect(summary.completionRate).toBeCloseTo(2 / 3, 3);
  });

  test('produces three PK winners instead of one harsh ranking', () => {
    const pk = buildFamilyPk([
      { childId: 'a', childName: '姐姐', totalPoints: 12, completionRate: 0.8, streakDays: 4 },
      { childId: 'b', childName: '弟弟', totalPoints: 10, completionRate: 1, streakDays: 3 }
    ]);

    expect(pk.pointsLeader.childId).toBe('a');
    expect(pk.completionLeader.childId).toBe('b');
    expect(pk.streakLeader.childId).toBe('a');
  });
});
