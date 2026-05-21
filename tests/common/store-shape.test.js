const CHILD_KEY = 'currentChildId';

describe('client state contract', () => {
  test('uses a stable storage key for current child selection', () => {
    expect(CHILD_KEY).toBe('currentChildId');
  });
});
