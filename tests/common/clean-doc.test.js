const { stripManagedFields } = require('../../cloudfunctions/api/common/clean-doc');

describe('stripManagedFields', () => {
  test('removes cloud-managed fields before persistence', () => {
    const cleaned = stripManagedFields({
      _id: 'cloud-id',
      _openid: 'user-openid',
      familyId: 'family-main',
      familyName: '我们一家'
    });

    expect(cleaned).toEqual({
      familyId: 'family-main',
      familyName: '我们一家'
    });
  });
});
