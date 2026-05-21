const DEFAULT_TASK_LIBRARY = [
  { title: '练字', taskType: 'habit', durationMin: 15, points: 2, isRequired: true },
  { title: '朗读', taskType: 'habit', durationMin: 10, points: 1, isRequired: true },
  { title: '阅读', taskType: 'study', durationMin: 20, points: 2, isRequired: true },
  { title: '口算', taskType: 'study', durationMin: 10, points: 2, isRequired: true },
  { title: '课外班', taskType: 'class', durationMin: 60, points: 3, isRequired: false }
];

const DEFAULT_REWARD_PRESETS = [
  { title: '冰淇淋', rewardType: 'item', unlockMode: 'points', thresholdValue: 5 },
  { title: '看电视 30 分钟', rewardType: 'time', unlockMode: 'points', thresholdValue: 8 },
  { title: '小玩具', rewardType: 'item', unlockMode: 'points', thresholdValue: 15 },
  { title: '游乐场', rewardType: 'experience', unlockMode: 'points', thresholdValue: 30 }
];

const TEMPLATES = {
  'lower-grade-habits': {
    weekdayTaskTitles: ['练字', '朗读']
  },
  'older-study-mix': {
    weekdayTaskTitles: ['阅读', '口算', '课外班']
  }
};

module.exports = {
  DEFAULT_TASK_LIBRARY,
  DEFAULT_REWARD_PRESETS,
  TEMPLATES
};
