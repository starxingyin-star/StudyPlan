const fs = require('fs');
const path = require('path');

const rewardsWxml = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/rewards/index.wxml'),
  'utf8'
);
const rewardsWxss = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/rewards/index.wxss'),
  'utf8'
);

describe('rewards page layout', () => {
  test('keeps redeem actions compact in the card bottom-right corner', () => {
    expect(rewardsWxml).toContain('class="reward-actions"');
    expect(rewardsWxml).toContain('<view class="redeem-btn"');
    expect(rewardsWxml).toContain('role="button"');
    expect(rewardsWxml).not.toContain('<button data-reward-rule-id="{{item.rewardRuleId}}"');

    expect(rewardsWxss).toMatch(/\.reward-card\s*\{[^}]*display:\s*flex;/s);
    expect(rewardsWxss).toMatch(/\.reward-card\s*\{[^}]*flex-direction:\s*column;/s);
    expect(rewardsWxss).toMatch(/\.reward-actions\s*\{[^}]*display:\s*flex;/s);
    expect(rewardsWxss).toMatch(/\.reward-actions\s*\{[^}]*justify-content:\s*flex-end;/s);
    expect(rewardsWxss).toMatch(/\.reward-actions\s*\{[^}]*margin-top:\s*14rpx;/s);
    expect(rewardsWxss).toMatch(/\.redeem-btn\s*\{[^}]*display:\s*flex;/s);
    expect(rewardsWxss).toMatch(/\.redeem-btn\s*\{[^}]*align-items:\s*center;/s);
    expect(rewardsWxss).toMatch(/\.redeem-btn\s*\{[^}]*justify-content:\s*center;/s);
    expect(rewardsWxss).toMatch(/\.redeem-btn\s*\{[^}]*width:\s*120rpx;/s);
    expect(rewardsWxss).toMatch(/\.redeem-btn\s*\{[^}]*height:\s*48rpx;/s);
    expect(rewardsWxss).toMatch(/\.redeem-btn\s*\{[^}]*font-size:\s*22rpx;/s);
  });

  test('renders family PK as a structured prize panel', () => {
    expect(rewardsWxml).toContain('class="pk-panel"');
    expect(rewardsWxml).toContain('class="pk-header"');
    expect(rewardsWxml).toContain('class="pk-grid"');
    expect(rewardsWxml).toContain('class="pk-prize points"');
    expect(rewardsWxml).toContain('class="pk-prize completion"');
    expect(rewardsWxml).toContain('class="pk-prize streak"');
    expect(rewardsWxml).toContain('class="pk-caption"');

    expect(rewardsWxss).toMatch(/\.pk-panel\s*\{[^}]*padding:\s*28rpx;/s);
    expect(rewardsWxss).toMatch(/\.pk-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/s);
    expect(rewardsWxss).toMatch(/\.pk-prize\s*\{[^}]*min-height:\s*150rpx;/s);
    expect(rewardsWxss).toMatch(/\.pk-medal\s*\{[^}]*width:\s*56rpx;/s);
  });
});
