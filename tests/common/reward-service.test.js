const { buildRewardRedemption } = require('../../cloudfunctions/api/common/reward-service');

describe('reward redemption', () => {
  test('deducts points only when the family has enough balance', () => {
    const redemption = buildRewardRedemption({
      childId: 'child-1',
      rewardRule: { rewardRuleId: 'reward-1', title: '冰淇淋', thresholdValue: 5 },
      currentPoints: 8,
      requestedAt: '2026-05-21T13:00:00.000Z',
      approvedByMemberId: 'member-1'
    });

    expect(redemption.redemption.pointsSpent).toBe(5);
    expect(redemption.pointLedger.deltaPoints).toBe(-5);
  });
});
