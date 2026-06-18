const fs = require('fs');
const path = require('path');

const weeklyPlanJs = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/pages/weekly-plan/index.js'),
  'utf8'
);

const {
  buildDayTabs,
  formatLocalDate,
  getWeekStartDate
} = require('../../miniprogram/utils/date');

describe('mini program date utilities', () => {
  test('builds week tabs on local calendar dates without UTC day shifts', () => {
    expect(buildDayTabs('2026-06-15')).toEqual([
      { date: '2026-06-15', label: '一' },
      { date: '2026-06-16', label: '二' },
      { date: '2026-06-17', label: '三' },
      { date: '2026-06-18', label: '四' },
      { date: '2026-06-19', label: '五' },
      { date: '2026-06-20', label: '六' },
      { date: '2026-06-21', label: '日' }
    ]);
  });

  test('formats local dates and calculates local week starts', () => {
    expect(formatLocalDate(new Date(2026, 5, 17, 16, 22))).toBe('2026-06-17');
    expect(getWeekStartDate(new Date(2026, 5, 17, 16, 22))).toBe('2026-06-15');
  });

  test('weekly plan page uses shared local date utilities', () => {
    expect(weeklyPlanJs).toContain("require('../../utils/date')");
    expect(weeklyPlanJs).not.toContain('toISOString().slice(0, 10)');
  });
});
