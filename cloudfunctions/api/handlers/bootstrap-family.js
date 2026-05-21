const { DEFAULT_REWARD_PRESETS } = require('../common/templates');

async function bootstrapFamily() {
  return {
    family: null,
    rewardPresets: DEFAULT_REWARD_PRESETS
  };
}

module.exports = {
  bootstrapFamily
};
