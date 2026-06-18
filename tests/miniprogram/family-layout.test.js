const fs = require('fs');
const path = require('path');

const familyWxml = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/family/index.wxml'),
  'utf8'
);
const familyWxss = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/family/index.wxss'),
  'utf8'
);

describe('family page member layout', () => {
  test('places the delete action in a compact right-side slot', () => {
    expect(familyWxml).toContain('class="member-card"');
    expect(familyWxml).toContain('class="member-main"');
    expect(familyWxml).toContain('<view class="mini-danger"');
    expect(familyWxml).toContain('role="button"');
    expect(familyWxml).not.toContain('<button class="mini-danger"');

    expect(familyWxss).toMatch(/\.member-card\s*\{[^}]*flex-direction:\s*row;/s);
    expect(familyWxss).toMatch(/\.member-card\s*\{[^}]*align-items:\s*center;/s);
    expect(familyWxss).toMatch(/\.member-main\s*\{[^}]*flex:\s*1;/s);
    expect(familyWxss).toMatch(/\.mini-danger\s*\{[^}]*display:\s*flex;/s);
    expect(familyWxss).toMatch(/\.mini-danger\s*\{[^}]*align-items:\s*center;/s);
    expect(familyWxss).toMatch(/\.mini-danger\s*\{[^}]*justify-content:\s*center;/s);
    expect(familyWxss).toMatch(/\.mini-danger\s*\{[^}]*width:\s*104rpx;/s);
    expect(familyWxss).toMatch(/\.mini-danger\s*\{[^}]*height:\s*44rpx;/s);
    expect(familyWxss).toMatch(/\.mini-danger\s*\{[^}]*font-size:\s*22rpx;/s);
  });

  test('gives text inputs a stable line box so Chinese text is not clipped', () => {
    expect(familyWxss).toMatch(/\.text-input\s*\{[^}]*height:\s*72rpx;/s);
    expect(familyWxss).toMatch(/\.text-input\s*\{[^}]*line-height:\s*72rpx;/s);
    expect(familyWxss).toMatch(/\.text-input\s*\{[^}]*padding:\s*0\s+16rpx;/s);
    expect(familyWxss).toMatch(/\.text-input\s*\{[^}]*font-size:\s*28rpx;/s);
  });
});
