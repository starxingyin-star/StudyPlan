const demoToday = {
  'child-older': {
    tasks: [
      { dailyTaskId: 'older-reading', title: '阅读', durationMin: 20, points: 2 },
      { dailyTaskId: 'older-math', title: '口算', durationMin: 10, points: 2 },
      { dailyTaskId: 'older-english', title: '英语朗读', durationMin: 10, points: 1 }
    ],
    summary: {
      totalTasks: 3,
      completedTasks: 1,
      streakDays: 5,
      totalPoints: 12
    }
  },
  'child-younger': {
    tasks: [
      { dailyTaskId: 'younger-writing', title: '练字', durationMin: 15, points: 2 },
      { dailyTaskId: 'younger-reading', title: '朗读', durationMin: 10, points: 1 }
    ],
    summary: {
      totalTasks: 2,
      completedTasks: 0,
      streakDays: 4,
      totalPoints: 10
    }
  }
};

async function getToday({ payload }) {
  const childId = payload.childId || 'child-younger';
  const result = demoToday[childId] || {
    tasks: [],
    summary: {
      totalTasks: 0,
      completedTasks: 0,
      streakDays: 0,
      totalPoints: 0
    }
  };

  return {
    childId,
    tasks: result.tasks,
    summary: result.summary
  };
}

module.exports = {
  getToday
};
