function buildWeeklySummary({ taskRecords, pointLedgers }) {
  const activeRecords = taskRecords.filter((record) => record.pauseReason !== 'paused-day');
  const completedCount = activeRecords.filter((record) => record.result === 'completed').length;
  const totalCount = activeRecords.length;
  const totalPoints = pointLedgers.reduce((sum, item) => sum + item.deltaPoints, 0);

  return {
    totalPoints,
    completedCount,
    totalCount,
    completionRate: totalCount ? completedCount / totalCount : 0
  };
}

function buildFamilyPk(childSummaries) {
  const pickWinner = (selector) => {
    return [...childSummaries].sort((left, right) => selector(right) - selector(left))[0];
  };

  return {
    pointsLeader: pickWinner((summary) => summary.totalPoints),
    completionLeader: pickWinner((summary) => summary.completionRate),
    streakLeader: pickWinner((summary) => summary.streakDays)
  };
}

module.exports = {
  buildWeeklySummary,
  buildFamilyPk
};
