function stripManagedFields(data = {}) {
  const {
    _id,
    _openid,
    ...rest
  } = data;

  return rest;
}

module.exports = {
  stripManagedFields
};
