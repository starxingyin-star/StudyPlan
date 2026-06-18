function getAwardedPoints({ result, points }) {
  return result === 'completed' ? points : 0;
}

function isPerfectDay(taskResults) {
  const requiredTasks = taskResults.filter((task) => task.isRequired);

  if (!requiredTasks.length) {
    return false;
  }

  return requiredTasks.every((task) => task.result === 'completed');
}

function getNextStreak({ previousStreak, isPausedDay, isPerfect }) {
  if (isPausedDay) {
    return previousStreak;
  }

  return isPerfect ? previousStreak + 1 : 0;
}

module.exports = {
  getAwardedPoints,
  isPerfectDay,
  getNextStreak
};
