async function saveTaskRecord({ payload }) {
  return {
    ok: true,
    taskId: payload.dailyTaskId
  };
}

module.exports = {
  saveTaskRecord
};
