const fs = require('fs');
const path = require('path');

const todayWxml = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/today/index.wxml'),
  'utf8'
);
const todayWxss = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/today/index.wxss'),
  'utf8'
);

describe('today page layout', () => {
  test('keeps the record status trigger compact in the card bottom-right corner', () => {
    expect(todayWxml).toContain('class="task-actions"');
    expect(todayWxml).toContain('<view wx:if="{{item.currentResult !== \'completed\'}}" class="action-btn"');
    expect(todayWxml).toContain('role="button"');
    expect(todayWxml).not.toMatch(/<button[^>]*class="action-btn"/s);

    expect(todayWxss).toMatch(/\.task-actions\s*\{[^}]*display:\s*flex;/s);
    expect(todayWxss).toMatch(/\.task-actions\s*\{[^}]*justify-content:\s*flex-end;/s);
    expect(todayWxss).toMatch(/\.task-actions\s*\{[^}]*margin-top:\s*12rpx;/s);
    expect(todayWxss).toMatch(/\.action-btn\s*\{[^}]*width:\s*128rpx;/s);
    expect(todayWxss).toMatch(/\.action-btn\s*\{[^}]*height:\s*44rpx;/s);
    expect(todayWxss).toMatch(/\.action-btn\s*\{[^}]*display:\s*flex;/s);
    expect(todayWxss).toMatch(/\.action-btn\s*\{[^}]*align-items:\s*center;/s);
    expect(todayWxss).toMatch(/\.action-btn\s*\{[^}]*justify-content:\s*center;/s);
    expect(todayWxss).toMatch(/\.action-btn\s*\{[^}]*font-size:\s*22rpx;/s);
    expect(todayWxss).not.toMatch(/\.action-btn\s*\{[^}]*line-height:/s);
  });

  test('separates task status buttons with stable spacing', () => {
    expect(todayWxml).toContain('class="action-grid"');
    expect(todayWxml).toContain('class="small-action"');

    expect(todayWxss).toMatch(/\.action-grid\s*\{[^}]*display:\s*flex;/s);
    expect(todayWxss).toMatch(/\.action-grid\s*\{[^}]*flex-wrap:\s*wrap;/s);
    expect(todayWxss).toMatch(/\.action-grid\s*\{[^}]*margin:\s*16rpx\s+-6rpx\s+0;/s);
    expect(todayWxss).toMatch(/\.small-action\s*\{[^}]*width:\s*calc\(50%\s*-\s*12rpx\);/s);
    expect(todayWxss).toMatch(/\.small-action\s*\{[^}]*margin:\s*6rpx;/s);
    expect(todayWxss).toMatch(/\.small-action\s*\{[^}]*height:\s*52rpx;/s);
    expect(todayWxss).toMatch(/\.small-action\s*\{[^}]*display:\s*flex;/s);
    expect(todayWxss).toMatch(/\.small-action\s*\{[^}]*align-items:\s*center;/s);
    expect(todayWxss).toMatch(/\.small-action\s*\{[^}]*justify-content:\s*center;/s);
    expect(todayWxss).not.toMatch(/\.small-action\s*\{[^}]*line-height:/s);
  });

  test('hides the status recorder after a task is completed', () => {
    expect(todayWxml).toContain('wx:if="{{item.currentResult !== \'completed\'}}"');
    expect(todayWxml).toMatch(
      /<view[^>]*wx:if="\{\{item\.currentResult !== 'completed'\}\}"[^>]*class="action-btn"[^>]*>记录<\/view>/s
    );
    expect(todayWxml).toContain(
      'wx:if="{{item.currentResult !== \'completed\' && expandedTaskId === item.dailyTaskId}}"'
    );
  });
});
