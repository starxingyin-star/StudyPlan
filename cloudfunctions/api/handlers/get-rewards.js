async function getRewards({ payload }) {
  return {
    childId: payload.childId,
    balance: 0,
    rewards: [],
    pk: null
  };
}

module.exports = {
  getRewards
};
