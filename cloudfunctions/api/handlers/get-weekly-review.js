const { buildWeeklySummary, buildFamilyPk } = require('../common/summary-service');

async function getWeeklyReview({ payload }) {
  const childId = payload.childId || 'child-younger';
  const sourceRecords = {
    'child-older': [
      { result: 'completed', pointsAwarded: 2, pauseReason: null },
      { result: 'completed', pointsAwarded: 2, pauseReason: null },
      { result: 'completed', pointsAwarded: 1, pauseReason: null },
      { result: 'missed', pointsAwarded: 0, pauseReason: null }
    ],
    'child-younger': [
      { result: 'completed', pointsAwarded: 2, pauseReason: null },
      { result: 'completed', pointsAwarded: 1, pauseReason: null },
      { result: 'completed', pointsAwarded: 2, pauseReason: null }
    ]
  };
  const sourceLedgers = {
    'child-older': [{ deltaPoints: 2 }, { deltaPoints: 2 }, { deltaPoints: 1 }],
    'child-younger': [{ deltaPoints: 2 }, { deltaPoints: 1 }, { deltaPoints: 2 }]
  };
  const summary = buildWeeklySummary({
    taskRecords: sourceRecords[childId] || [],
    pointLedgers: sourceLedgers[childId] || []
  });
  const pk = buildFamilyPk([
    { childId: 'child-older', childName: '姐姐', totalPoints: 12, completionRate: 0.75, streakDays: 5 },
    { childId: 'child-younger', childName: '弟弟', totalPoints: 10, completionRate: 1, streakDays: 4 }
  ]);

  return {
    childId,
    summary,
    pk
  };
}

module.exports = {
  getWeeklyReview
};
