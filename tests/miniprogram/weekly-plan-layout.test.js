const fs = require('fs');
const path = require('path');

const weeklyPlanWxml = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/weekly-plan/index.wxml'),
  'utf8'
);
const weeklyPlanWxss = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/weekly-plan/index.wxss'),
  'utf8'
);

describe('weekly plan layout', () => {
  test('keeps task delete buttons compact and right aligned', () => {
    expect(weeklyPlanWxml).toContain('class="card-main"');
    expect(weeklyPlanWxml).toContain('class="task-summary"');
    expect(weeklyPlanWxml).toContain('class="remove-slot"');
    expect(weeklyPlanWxml).toContain('<view class="remove-btn"');
    expect(weeklyPlanWxml).toContain('role="button"');
    expect(weeklyPlanWxml).not.toContain('<button plain="true" class="remove-btn"');

    expect(weeklyPlanWxss).toMatch(/\.card-main\s*\{[^}]*justify-content:\s*space-between;/s);
    expect(weeklyPlanWxss).toMatch(/\.card-main\s*\{[^}]*align-items:\s*center;/s);
    expect(weeklyPlanWxss).toMatch(/\.task-summary\s*\{[^}]*flex:\s*1;/s);
    expect(weeklyPlanWxss).toMatch(/\.task-summary\s*\{[^}]*min-width:\s*0;/s);
    expect(weeklyPlanWxss).toMatch(/\.remove-slot\s*\{[^}]*width:\s*104rpx;/s);
    expect(weeklyPlanWxss).toMatch(/\.remove-slot\s*\{[^}]*flex:\s*0\s+0\s+104rpx;/s);
    expect(weeklyPlanWxss).toMatch(/\.remove-btn\s*\{[^}]*width:\s*104rpx;/s);
    expect(weeklyPlanWxss).toMatch(/\.remove-btn\s*\{[^}]*height:\s*48rpx;/s);
    expect(weeklyPlanWxss).toMatch(/\.remove-btn\s*\{[^}]*display:\s*flex;/s);
    expect(weeklyPlanWxss).toMatch(/\.remove-btn\s*\{[^}]*align-items:\s*center;/s);
    expect(weeklyPlanWxss).toMatch(/\.remove-btn\s*\{[^}]*justify-content:\s*center;/s);
  });
});
