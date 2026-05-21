const { DEFAULT_REWARD_PRESETS } = require('../common/templates');

async function bootstrapFamily() {
  return {
    family: {
      familyId: 'demo-family',
      familyName: '我们一家',
      pkEnabled: true
    },
    members: [
      {
        memberId: 'child-older',
        displayName: '姐姐',
        isChild: true,
        relationType: 'child',
        grade: '四年级'
      },
      {
        memberId: 'child-younger',
        displayName: '弟弟',
        isChild: true,
        relationType: 'child',
        grade: '二年级'
      },
      {
        memberId: 'member-father',
        displayName: '爸爸',
        isChild: false,
        relationType: 'father'
      },
      {
        memberId: 'member-grandmother',
        displayName: '奶奶',
        isChild: false,
        relationType: 'grandmother'
      }
    ],
    rewardPresets: DEFAULT_REWARD_PRESETS
  };
}

module.exports = {
  bootstrapFamily
};
