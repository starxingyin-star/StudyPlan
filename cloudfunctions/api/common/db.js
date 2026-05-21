const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

module.exports = {
  cloud,
  db,
  collections: {
    families: db.collection('families'),
    members: db.collection('members'),
    weeklyPlans: db.collection('weeklyPlans'),
    dailyTasks: db.collection('dailyTasks'),
    taskRecords: db.collection('taskRecords'),
    rewardRules: db.collection('rewardRules'),
    pointLedgers: db.collection('pointLedgers'),
    rewardRedemptions: db.collection('rewardRedemptions')
  }
};
