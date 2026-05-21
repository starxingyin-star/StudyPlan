async function saveFamilySettings({ payload }) {
  return {
    ok: true,
    familyId: payload.familyId || null
  };
}

module.exports = {
  saveFamilySettings
};
