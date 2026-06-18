const fs = require('fs');
const path = require('path');

const rewardSettingsWxml = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/reward-settings/index.wxml'),
  'utf8'
);
const rewardSettingsWxss = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/reward-settings/index.wxss'),
  'utf8'
);

describe('reward settings layout', () => {
  test('uses compact view controls for reward deletion', () => {
    expect(rewardSettingsWxml).toContain('<view class="mini-danger"');
    expect(rewardSettingsWxml).toContain('role="button"');
    expect(rewardSettingsWxml).not.toContain('<button class="mini-danger"');

    expect(rewardSettingsWxss).toMatch(/\.mini-danger\s*\{[^}]*display:\s*flex;/s);
    expect(rewardSettingsWxss).toMatch(/\.mini-danger\s*\{[^}]*align-items:\s*center;/s);
    expect(rewardSettingsWxss).toMatch(/\.mini-danger\s*\{[^}]*justify-content:\s*center;/s);
    expect(rewardSettingsWxss).toMatch(/\.mini-danger\s*\{[^}]*width:\s*104rpx;/s);
    expect(rewardSettingsWxss).toMatch(/\.mini-danger\s*\{[^}]*height:\s*44rpx;/s);
  });
});
