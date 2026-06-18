async function resolveChildId({ collections, familyId, requestedChildId }) {
  const childrenResult = await collections.members.where({ familyId, isChild: true }).get();
  const children = childrenResult.data || [];
  const requested = children.find((member) => member.memberId === requestedChildId);
  if (requested) {
    return requested.memberId;
  }
  return children[0] ? children[0].memberId : requestedChildId;
}

module.exports = {
  resolveChildId
};
