async function getWeeklyReview({ payload }) {
  return {
    childId: payload.childId,
    summary: null,
    pk: null
  };
}

module.exports = {
  getWeeklyReview
};
