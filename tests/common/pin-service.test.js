const { verifyPin } = require('../../cloudfunctions/api/common/pin-service');

describe('pin service', () => {
  test('accepts exact pin matches and rejects wrong pins', () => {
    expect(verifyPin({ storedPin: '2468', enteredPin: '2468' })).toBe(true);
    expect(verifyPin({ storedPin: '2468', enteredPin: '1111' })).toBe(false);
  });
});
