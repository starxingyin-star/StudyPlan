const fs = require('fs');
const path = require('path');

function readWxss(relativePath) {
  return fs.readFileSync(path.join(__dirname, '../../', relativePath), 'utf8');
}

function expectStableInputLineBox(wxss, className, { height, padding, fontSize }) {
  const selector = className.replace('.', '\\.');

  expect(wxss).toMatch(new RegExp(`${selector}\\s*\\{[^}]*height:\\s*${height};`, 's'));
  expect(wxss).toMatch(new RegExp(`${selector}\\s*\\{[^}]*line-height:\\s*${height};`, 's'));
  expect(wxss).toMatch(new RegExp(`${selector}\\s*\\{[^}]*padding:\\s*${padding};`, 's'));
  expect(wxss).toMatch(new RegExp(`${selector}\\s*\\{[^}]*font-size:\\s*${fontSize};`, 's'));
}

describe('mini program input layout', () => {
  test('keeps page input text from being vertically clipped', () => {
    expectStableInputLineBox(
      readWxss('miniprogram/pages/reward-settings/index.wxss'),
      '.text-input',
      { height: '72rpx', padding: '0\\s+16rpx', fontSize: '28rpx' }
    );

    expectStableInputLineBox(
      readWxss('miniprogram/pages/weekly-plan/index.wxss'),
      '.custom-input',
      { height: '72rpx', padding: '0\\s+16rpx', fontSize: '28rpx' }
    );

    expectStableInputLineBox(
      readWxss('miniprogram/pages/today/index.wxss'),
      '.note-input',
      { height: '72rpx', padding: '0\\s+16rpx', fontSize: '28rpx' }
    );
  });

  test('keeps PIN input text from being vertically clipped', () => {
    expectStableInputLineBox(
      readWxss('miniprogram/components/pin-sheet/index.wxss'),
      '.pin-input',
      { height: '80rpx', padding: '0\\s+20rpx', fontSize: '30rpx' }
    );
  });
});
