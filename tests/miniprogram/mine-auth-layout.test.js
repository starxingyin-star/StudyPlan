const fs = require('fs');
const path = require('path');

const mineWxml = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/mine/index.wxml'),
  'utf8'
);
const mineWxss = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/mine/index.wxss'),
  'utf8'
);
const mineJs = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/mine/index.js'),
  'utf8'
);

describe('mine auth layout', () => {
  test('shows setup and invite controls without native wide buttons', () => {
    expect(mineWxml).toContain('wx:if="{{needsFamilySetup}}"');
    expect(mineWxml).toContain('bindtap="onCreateFamily"');
    expect(mineWxml).toContain('bindtap="onJoinFamily"');
    expect(mineWxml).toContain('bindtap="onCreateInvite"');
    expect(mineWxml).toContain('bindtap="onCopyInviteToken"');
    expect(mineWxml).toContain('placeholder="6 位邀请码"');
    expect(mineWxml).toContain('maxlength="6"');
    expect(mineWxml).toContain('<view class="primary-action" role="button"');
    expect(mineWxml).toContain('<view class="secondary-action" role="button"');
    expect(mineWxml).toContain('<view class="small-action" role="button"');

    expect(mineWxss).toMatch(/\.setup-input\s*\{[^}]*height:\s*72rpx;/s);
    expect(mineWxss).toMatch(/\.setup-input\s*\{[^}]*line-height:\s*72rpx;/s);
    expect(mineWxss).toMatch(/\.setup-actions\s*\{[^}]*justify-content:\s*flex-end;/s);
    expect(mineWxss).toMatch(/\.primary-action,\s*\n\.secondary-action\s*\{[^}]*width:\s*156rpx;/s);
    expect(mineWxss).toMatch(/\.small-action\s*\{[^}]*width:\s*104rpx;/s);
  });

  test('copies the generated invite token with a compact action', () => {
    expect(mineWxml).toContain('class="invite-token"');
    expect(mineWxml).toContain('复制');
    expect(mineWxss).toMatch(/\.invite-token-row\s*\{[^}]*display:\s*flex;/s);
    expect(mineWxss).toMatch(/\.copy-action\s*\{[^}]*width:\s*88rpx;/s);
    expect(mineJs).toContain('onCopyInviteToken()');
    expect(mineJs).toContain('wx.setClipboardData');
  });
});
