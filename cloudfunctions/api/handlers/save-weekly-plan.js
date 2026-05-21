async function saveWeeklyPlan({ payload }) {
  return {
    ok: true,
    childId: payload.childId,
    weekStartDate: payload.weekStartDate
  };
}

module.exports = {
  saveWeeklyPlan
};
