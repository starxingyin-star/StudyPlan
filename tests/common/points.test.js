const {
  getAwardedPoints,
  isPerfectDay,
  getNextStreak
} = require('../../cloudfunctions/api/common/points');

describe('points rules', () => {
  test('awards full points only for completed tasks', () => {
    expect(getAwardedPoints({ result: 'completed', points: 2 })).toBe(2);
    expect(getAwardedPoints({ result: 'partial', points: 2 })).toBe(0);
    expect(getAwardedPoints({ result: 'missed', points: 2 })).toBe(0);
  });

  test('requires all required tasks to be completed for a perfect day', () => {
    expect(
      isPerfectDay([
        { isRequired: true, result: 'completed' },
        { isRequired: true, result: 'completed' },
        { isRequired: false, result: 'missed' }
      ])
    ).toBe(true);

    expect(
      isPerfectDay([
        { isRequired: true, result: 'completed' },
        { isRequired: true, result: 'partial' }
      ])
    ).toBe(false);
  });

  test('preserves streak on paused days and resets on imperfect days', () => {
    expect(getNextStreak({ previousStreak: 4, isPausedDay: true, isPerfect: false })).toBe(4);
    expect(getNextStreak({ previousStreak: 4, isPausedDay: false, isPerfect: true })).toBe(5);
    expect(getNextStreak({ previousStreak: 4, isPausedDay: false, isPerfect: false })).toBe(0);
  });
});
