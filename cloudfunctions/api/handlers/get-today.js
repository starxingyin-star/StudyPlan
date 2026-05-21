async function getToday({ payload }) {
  return {
    childId: payload.childId,
    tasks: [],
    summary: {
      totalTasks: 0,
      completedTasks: 0,
      streakDays: 0,
      totalPoints: 0
    }
  };
}

module.exports = {
  getToday
};
