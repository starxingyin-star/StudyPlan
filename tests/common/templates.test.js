const {
  DEFAULT_TASK_LIBRARY,
  DEFAULT_REWARD_PRESETS
} = require('../../cloudfunctions/api/common/templates');
const { buildWeeklyPlanDraft } = require('../../cloudfunctions/api/common/plan-service');

describe('weekly plan templates', () => {
  test('creates child-specific weekday tasks from focus habits', () => {
    const draft = buildWeeklyPlanDraft({
      childId: 'child-2',
      weekStartDate: '2026-05-25',
      templateId: 'lower-grade-habits',
      focusHabits: ['练字', '朗读']
    });

    expect(draft.childId).toBe('child-2');
    expect(draft.days['2026-05-25'].map((task) => task.title)).toEqual(['练字', '朗读']);
    expect(draft.days['2026-05-30']).toEqual([]);
  });

  test('ships starter reward presets and task library entries', () => {
    expect(DEFAULT_TASK_LIBRARY.some((task) => task.title === '练字')).toBe(true);
    expect(DEFAULT_REWARD_PRESETS.some((reward) => reward.title === '冰淇淋')).toBe(true);
  });

  test('normalizes manually edited day tasks for persistence', () => {
    const draft = buildWeeklyPlanDraft({
      childId: 'child-2',
      weekStartDate: '2026-05-25',
      templateId: 'lower-grade-habits',
      focusHabits: ['练字', '朗读'],
      tasksByDay: {
        '2026-05-25': [
          { title: '阅读', taskType: 'study', durationMin: 20, points: 2, isRequired: true },
          { title: '口算', taskType: 'study', durationMin: 10, points: 2, isRequired: true }
        ]
      }
    });

    expect(draft.days['2026-05-25'].map((task) => task.title)).toEqual(['阅读', '口算']);
    expect(draft.days['2026-05-25'][0].sortOrder).toBe(1);
    expect(draft.days['2026-05-25'][1].sourceType).toBe('manual');
  });
});
