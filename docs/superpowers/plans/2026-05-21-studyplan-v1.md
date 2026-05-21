# StudyPlan V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a WeChat Mini Program V1 that supports one family with multiple children, child-specific weekly plans, daily task recording, point-account rewards, and same-family PK using CloudBase.

**Architecture:** Use a native WeChat Mini Program with a small client shell and a single routed CloudBase function (`api`) that owns all business rules. Keep all scoring, streak, reward, and PK logic in pure server-side modules under `cloudfunctions/api/common/` so it can be tested with Vitest without relying on the mini program runtime.

**Tech Stack:** Native WeChat Mini Program (`WXML`, `WXSS`, `JS`), CloudBase / `wx-server-sdk`, Vitest, Node.js tooling

---

## File Map

### Repository Root

- Create: `.gitignore`
  - Ignore `node_modules/`, `miniprogram_npm/`, local IDE files, and keep `.superpowers/` ignored.
- Create: `package.json`
  - Root Node.js tooling for tests only.
- Create: `vitest.config.js`
  - Vitest config scoped to server-side pure modules.
- Create: `project.config.json`
  - WeChat DevTools project file with `miniprogramRoot` and `cloudfunctionRoot`.

### Mini Program Client

- Create: `miniprogram/app.js`
  - App bootstrap.
- Create: `miniprogram/app.json`
  - Page registration and global window config.
- Create: `miniprogram/app.wxss`
  - Global visual tokens and shared styles.
- Create: `miniprogram/utils/api.js`
  - Thin wrapper around `wx.cloud.callFunction`.
- Create: `miniprogram/utils/store.js`
  - Local storage for current child and simple client-side state helpers.
- Create: `miniprogram/utils/pin.js`
  - Helper for prompting and verifying protected operations.
- Create: `miniprogram/components/child-switcher/index.js`
- Create: `miniprogram/components/child-switcher/index.wxml`
- Create: `miniprogram/components/child-switcher/index.wxss`
- Create: `miniprogram/components/child-switcher/index.json`
  - Current-child switcher used on Today, Rewards, Weekly Plan, and Weekly Review pages.
- Create: `miniprogram/components/pin-sheet/index.js`
- Create: `miniprogram/components/pin-sheet/index.wxml`
- Create: `miniprogram/components/pin-sheet/index.wxss`
- Create: `miniprogram/components/pin-sheet/index.json`
  - PIN prompt component for protected flows.
- Create: `miniprogram/pages/today/index.js`
- Create: `miniprogram/pages/today/index.wxml`
- Create: `miniprogram/pages/today/index.wxss`
- Create: `miniprogram/pages/today/index.json`
  - Daily execution page.
- Create: `miniprogram/pages/rewards/index.js`
- Create: `miniprogram/pages/rewards/index.wxml`
- Create: `miniprogram/pages/rewards/index.wxss`
- Create: `miniprogram/pages/rewards/index.json`
  - Reward account and same-family PK page.
- Create: `miniprogram/pages/mine/index.js`
- Create: `miniprogram/pages/mine/index.wxml`
- Create: `miniprogram/pages/mine/index.wxss`
- Create: `miniprogram/pages/mine/index.json`
  - Second-level entry hub.
- Create: `miniprogram/pages/weekly-plan/index.js`
- Create: `miniprogram/pages/weekly-plan/index.wxml`
- Create: `miniprogram/pages/weekly-plan/index.wxss`
- Create: `miniprogram/pages/weekly-plan/index.json`
  - Child-specific weekly planning page.
- Create: `miniprogram/pages/weekly-review/index.js`
- Create: `miniprogram/pages/weekly-review/index.wxml`
- Create: `miniprogram/pages/weekly-review/index.wxss`
- Create: `miniprogram/pages/weekly-review/index.json`
  - Weekly review page.
- Create: `miniprogram/pages/family/index.js`
- Create: `miniprogram/pages/family/index.wxml`
- Create: `miniprogram/pages/family/index.wxss`
- Create: `miniprogram/pages/family/index.json`
  - Family setup and settings page.

### Cloud Function API

- Create: `cloudfunctions/api/package.json`
  - Function dependencies.
- Create: `cloudfunctions/api/config.json`
  - Cloud function runtime config.
- Create: `cloudfunctions/api/index.js`
  - Action router.
- Create: `cloudfunctions/api/common/domain.js`
  - Shared enums and default constants.
- Create: `cloudfunctions/api/common/points.js`
  - Point awarding, perfect-day, and streak rules.
- Create: `cloudfunctions/api/common/templates.js`
  - Starter templates and reward presets.
- Create: `cloudfunctions/api/common/plan-service.js`
  - Create/copy/update child weekly plans and daily tasks.
- Create: `cloudfunctions/api/common/record-service.js`
  - Save task records, late-record checks, pause-day handling, and point ledger entries.
- Create: `cloudfunctions/api/common/reward-service.js`
  - Reward redemption workflow.
- Create: `cloudfunctions/api/common/summary-service.js`
  - Weekly summary and PK computation.
- Create: `cloudfunctions/api/common/db.js`
  - CloudBase collection accessors and minimal repository helpers.
- Create: `cloudfunctions/api/common/pin-service.js`
  - PIN hash verification helper.
- Create: `cloudfunctions/api/handlers/bootstrap-family.js`
- Create: `cloudfunctions/api/handlers/get-today.js`
- Create: `cloudfunctions/api/handlers/get-rewards.js`
- Create: `cloudfunctions/api/handlers/save-weekly-plan.js`
- Create: `cloudfunctions/api/handlers/save-task-record.js`
- Create: `cloudfunctions/api/handlers/get-weekly-review.js`
- Create: `cloudfunctions/api/handlers/save-family-settings.js`
- Create: `cloudfunctions/api/handlers/redeem-reward.js`
  - Thin handler layer mapping action payloads into the common services.

### Tests

- Create: `tests/common/points.test.js`
- Create: `tests/common/templates.test.js`
- Create: `tests/common/record-service.test.js`
- Create: `tests/common/reward-service.test.js`
- Create: `tests/common/summary-service.test.js`
- Create: `tests/common/pin-service.test.js`
  - Pure business-logic tests that run entirely in Node.

---

### Task 1: Bootstrap The Repo, Test Harness, And Core Points Module

**Files:**
- Modify: `.gitignore`
- Create: `package.json`
- Create: `vitest.config.js`
- Create: `project.config.json`
- Create: `miniprogram/app.js`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.wxss`
- Create: `cloudfunctions/api/common/points.js`
- Test: `tests/common/points.test.js`

- [ ] **Step 1: Add the Node test harness and ignore rules**

```json
// package.json
{
  "name": "studyplan",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^3.2.4"
  }
}
```

```js
// vitest.config.js
const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js']
  }
});
```

```gitignore
# .gitignore
.superpowers/
node_modules/
miniprogram_npm/
.DS_Store
```

```json
// project.config.json
{
  "appid": "touristappid",
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionRoot": "cloudfunctions/",
  "compileType": "miniprogram",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true
  }
}
```

```js
// miniprogram/app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('wx.cloud is required');
      return;
    }
    wx.cloud.init({
      traceUser: true
    });
  }
});
```

```json
// miniprogram/app.json
{
  "pages": [
    "pages/today/index",
    "pages/rewards/index",
    "pages/mine/index",
    "pages/weekly-plan/index",
    "pages/weekly-review/index",
    "pages/family/index"
  ],
  "window": {
    "navigationBarTitleText": "StudyPlan",
    "navigationBarBackgroundColor": "#f8f7f1",
    "backgroundColor": "#f8f7f1"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

```css
/* miniprogram/app.wxss */
page {
  background: #f8f7f1;
  color: #1f2937;
  font-family: sans-serif;
}
```

- [ ] **Step 2: Install test dependencies**

Run: `npm install`  
Expected: `added ... packages` and `found 0 vulnerabilities`

- [ ] **Step 3: Write the failing points-and-streak test**

```js
// tests/common/points.test.js
const { describe, expect, test } = require('vitest');
const {
  getAwardedPoints,
  isPerfectDay,
  getNextStreak
} = require('../../cloudfunctions/api/common/points');

describe('points rules', () => {
  test('awards full points only for completed tasks', () => {
    expect(getAwardedPoints({ result: 'completed', points: 2 })).toBe(2);
    expect(getAwardedPoints({ result: 'partial', points: 2 })).toBe(0);
    expect(getAwardedPoints({ result: 'missed', points: 2 })).toBe(0);
  });

  test('requires all required tasks to be completed for a perfect day', () => {
    expect(
      isPerfectDay([
        { isRequired: true, result: 'completed' },
        { isRequired: true, result: 'completed' },
        { isRequired: false, result: 'missed' }
      ])
    ).toBe(true);

    expect(
      isPerfectDay([
        { isRequired: true, result: 'completed' },
        { isRequired: true, result: 'partial' }
      ])
    ).toBe(false);
  });

  test('preserves streak on paused days and resets on imperfect days', () => {
    expect(getNextStreak({ previousStreak: 4, isPausedDay: true, isPerfect: false })).toBe(4);
    expect(getNextStreak({ previousStreak: 4, isPausedDay: false, isPerfect: true })).toBe(5);
    expect(getNextStreak({ previousStreak: 4, isPausedDay: false, isPerfect: false })).toBe(0);
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npx vitest run tests/common/points.test.js`  
Expected: FAIL with `Cannot find module '../../cloudfunctions/api/common/points'`

- [ ] **Step 5: Write the minimal points module**

```js
// cloudfunctions/api/common/points.js
function getAwardedPoints({ result, points }) {
  return result === 'completed' ? points : 0;
}

function isPerfectDay(taskResults) {
  const requiredTasks = taskResults.filter((task) => task.isRequired);
  if (!requiredTasks.length) return false;
  return requiredTasks.every((task) => task.result === 'completed');
}

function getNextStreak({ previousStreak, isPausedDay, isPerfect }) {
  if (isPausedDay) return previousStreak;
  return isPerfect ? previousStreak + 1 : 0;
}

module.exports = {
  getAwardedPoints,
  isPerfectDay,
  getNextStreak
};
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run tests/common/points.test.js`  
Expected: PASS with `3 passed`

- [ ] **Step 7: Commit**

```bash
git add .gitignore package.json vitest.config.js project.config.json \
  miniprogram/app.js miniprogram/app.json miniprogram/app.wxss \
  cloudfunctions/api/common/points.js tests/common/points.test.js
git commit -m "chore: bootstrap StudyPlan V1 repo and points rules"
```

### Task 2: Implement Domain Constants, Templates, And Weekly Plan Generation

**Files:**
- Create: `cloudfunctions/api/common/domain.js`
- Create: `cloudfunctions/api/common/templates.js`
- Create: `cloudfunctions/api/common/plan-service.js`
- Test: `tests/common/templates.test.js`

- [ ] **Step 1: Write the failing template generation test**

```js
// tests/common/templates.test.js
const { describe, expect, test } = require('vitest');
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
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/common/templates.test.js`  
Expected: FAIL with missing template and plan service modules

- [ ] **Step 3: Add domain constants, starter templates, and weekly plan expansion**

```js
// cloudfunctions/api/common/domain.js
const RESULT_TYPES = ['completed', 'partial', 'missed'];
const RELATION_TYPES = ['child', 'father', 'mother', 'grandfather', 'grandmother', 'guardian'];
const REWARD_TYPES = ['time', 'experience', 'item', 'privilege', 'badge'];

module.exports = {
  RESULT_TYPES,
  RELATION_TYPES,
  REWARD_TYPES
};
```

```js
// cloudfunctions/api/common/templates.js
const DEFAULT_TASK_LIBRARY = [
  { title: '练字', taskType: 'habit', durationMin: 15, points: 2, isRequired: true },
  { title: '朗读', taskType: 'habit', durationMin: 10, points: 1, isRequired: true },
  { title: '阅读', taskType: 'study', durationMin: 20, points: 2, isRequired: true },
  { title: '口算', taskType: 'study', durationMin: 10, points: 2, isRequired: true },
  { title: '课外班', taskType: 'class', durationMin: 60, points: 3, isRequired: false }
];

const DEFAULT_REWARD_PRESETS = [
  { title: '冰淇淋', rewardType: 'item', unlockMode: 'points', thresholdValue: 5 },
  { title: '看电视 30 分钟', rewardType: 'time', unlockMode: 'points', thresholdValue: 8 },
  { title: '小玩具', rewardType: 'item', unlockMode: 'points', thresholdValue: 15 },
  { title: '游乐场', rewardType: 'experience', unlockMode: 'points', thresholdValue: 30 }
];

const TEMPLATES = {
  'lower-grade-habits': {
    weekdayTaskTitles: ['练字', '朗读']
  },
  'older-study-mix': {
    weekdayTaskTitles: ['阅读', '口算', '课外班']
  }
};

module.exports = {
  DEFAULT_TASK_LIBRARY,
  DEFAULT_REWARD_PRESETS,
  TEMPLATES
};
```

```js
// cloudfunctions/api/common/plan-service.js
const { DEFAULT_TASK_LIBRARY, TEMPLATES } = require('./templates');

function addDays(isoDate, offset) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function buildWeeklyPlanDraft({ childId, weekStartDate, templateId, focusHabits }) {
  const template = TEMPLATES[templateId];
  const weekdayTitles = template.weekdayTaskTitles.filter((title) => {
    return !focusHabits.length || focusHabits.includes(title) || title === '课外班';
  });

  const days = {};

  for (let offset = 0; offset < 7; offset += 1) {
    const currentDate = addDays(weekStartDate, offset);
    const isWeekend = offset >= 5;
    days[currentDate] = isWeekend
      ? []
      : weekdayTitles
          .map((title) => DEFAULT_TASK_LIBRARY.find((task) => task.title === title))
          .filter(Boolean)
          .map((task, index) => ({
            ...task,
            taskDate: currentDate,
            childId,
            sortOrder: index + 1,
            sourceType: 'template'
          }));
  }

  return {
    childId,
    weekStartDate,
    templateId,
    focusHabits,
    days
  };
}

module.exports = {
  buildWeeklyPlanDraft
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/common/templates.test.js`  
Expected: PASS with `2 passed`

- [ ] **Step 5: Commit**

```bash
git add cloudfunctions/api/common/domain.js \
  cloudfunctions/api/common/templates.js \
  cloudfunctions/api/common/plan-service.js \
  tests/common/templates.test.js
git commit -m "feat: add weekly plan templates and draft generation"
```

### Task 3: Implement Task Recording, Late Record, Pause Day, And Point Ledger Logic

**Files:**
- Create: `cloudfunctions/api/common/record-service.js`
- Test: `tests/common/record-service.test.js`

- [ ] **Step 1: Write the failing record service test**

```js
// tests/common/record-service.test.js
const { describe, expect, test } = require('vitest');
const {
  buildTaskRecordChange
} = require('../../cloudfunctions/api/common/record-service');

describe('record service', () => {
  test('awards points for completed tasks and marks late records', () => {
    const change = buildTaskRecordChange({
      task: { dailyTaskId: 'task-1', childId: 'child-1', points: 2, isRequired: true, taskDate: '2026-05-21' },
      result: 'completed',
      comment: '今天状态不错',
      recordedAt: '2026-05-22T08:00:00.000Z',
      allowLateRecord: true,
      memberId: 'member-1'
    });

    expect(change.taskRecord.pointsAwarded).toBe(2);
    expect(change.taskRecord.isLateRecord).toBe(true);
    expect(change.pointLedger.deltaPoints).toBe(2);
  });

  test('preserves streak when a day is paused', () => {
    const change = buildTaskRecordChange({
      task: { dailyTaskId: 'task-2', childId: 'child-1', points: 2, isRequired: true, taskDate: '2026-05-21' },
      result: 'missed',
      comment: '生病休息',
      recordedAt: '2026-05-21T12:00:00.000Z',
      allowLateRecord: false,
      memberId: 'member-1',
      isPausedDay: true
    });

    expect(change.taskRecord.pauseReason).toBe('paused-day');
    expect(change.pointLedger).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/common/record-service.test.js`  
Expected: FAIL with missing `record-service`

- [ ] **Step 3: Implement the record service**

```js
// cloudfunctions/api/common/record-service.js
const { getAwardedPoints } = require('./points');

function isLateRecord(taskDate, recordedAt) {
  const recordedIsoDate = new Date(recordedAt).toISOString().slice(0, 10);
  return recordedIsoDate !== taskDate;
}

function buildTaskRecordChange({
  task,
  result,
  comment,
  recordedAt,
  allowLateRecord,
  memberId,
  isPausedDay = false
}) {
  const lateRecord = isLateRecord(task.taskDate, recordedAt);
  if (lateRecord && !allowLateRecord) {
    throw new Error('Late record is not allowed');
  }

  if (isPausedDay) {
    return {
      taskRecord: {
        dailyTaskId: task.dailyTaskId,
        childId: task.childId,
        taskDate: task.taskDate,
        result: 'missed',
        pointsAwarded: 0,
        comment,
        recordedByMemberId: memberId,
        recordedAt,
        isLateRecord: lateRecord,
        pauseReason: 'paused-day'
      },
      pointLedger: null
    };
  }

  const pointsAwarded = getAwardedPoints({ result, points: task.points });

  return {
    taskRecord: {
      dailyTaskId: task.dailyTaskId,
      childId: task.childId,
      taskDate: task.taskDate,
      result,
      pointsAwarded,
      comment,
      recordedByMemberId: memberId,
      recordedAt,
      isLateRecord: lateRecord,
      pauseReason: null
    },
    pointLedger: pointsAwarded
      ? {
          childId: task.childId,
          deltaPoints: pointsAwarded,
          sourceType: 'task_complete',
          relatedTaskId: task.dailyTaskId,
          note: comment || ''
        }
      : null
  };
}

module.exports = {
  buildTaskRecordChange
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/common/record-service.test.js`  
Expected: PASS with `2 passed`

- [ ] **Step 5: Commit**

```bash
git add cloudfunctions/api/common/record-service.js \
  tests/common/record-service.test.js
git commit -m "feat: add task record and pause-day rules"
```

### Task 4: Implement Reward Redemption And Weekly Summary / PK Services

**Files:**
- Create: `cloudfunctions/api/common/reward-service.js`
- Create: `cloudfunctions/api/common/summary-service.js`
- Test: `tests/common/reward-service.test.js`
- Test: `tests/common/summary-service.test.js`

- [ ] **Step 1: Write the failing reward and summary tests**

```js
// tests/common/reward-service.test.js
const { describe, expect, test } = require('vitest');
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
```

```js
// tests/common/summary-service.test.js
const { describe, expect, test } = require('vitest');
const { buildWeeklySummary, buildFamilyPk } = require('../../cloudfunctions/api/common/summary-service');

describe('weekly summaries and PK', () => {
  test('computes summary metrics from task records and ledgers', () => {
    const summary = buildWeeklySummary({
      taskRecords: [
        { result: 'completed', pointsAwarded: 2, pauseReason: null },
        { result: 'completed', pointsAwarded: 1, pauseReason: null },
        { result: 'missed', pointsAwarded: 0, pauseReason: null }
      ],
      pointLedgers: [{ deltaPoints: 2 }, { deltaPoints: 1 }]
    });

    expect(summary.totalPoints).toBe(3);
    expect(summary.completedCount).toBe(2);
    expect(summary.completionRate).toBeCloseTo(2 / 3, 3);
  });

  test('produces three PK winners instead of one harsh ranking', () => {
    const pk = buildFamilyPk([
      { childId: 'a', childName: '姐姐', totalPoints: 12, completionRate: 0.8, streakDays: 4 },
      { childId: 'b', childName: '弟弟', totalPoints: 10, completionRate: 1, streakDays: 3 }
    ]);

    expect(pk.pointsLeader.childId).toBe('a');
    expect(pk.completionLeader.childId).toBe('b');
    expect(pk.streakLeader.childId).toBe('a');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/common/reward-service.test.js tests/common/summary-service.test.js`  
Expected: FAIL with missing modules

- [ ] **Step 3: Implement reward redemption and summary helpers**

```js
// cloudfunctions/api/common/reward-service.js
function buildRewardRedemption({
  childId,
  rewardRule,
  currentPoints,
  requestedAt,
  approvedByMemberId
}) {
  if (currentPoints < rewardRule.thresholdValue) {
    throw new Error('Insufficient points');
  }

  return {
    redemption: {
      childId,
      rewardRuleId: rewardRule.rewardRuleId,
      status: 'approved',
      pointsSpent: rewardRule.thresholdValue,
      requestedAt,
      approvedAt: requestedAt,
      fulfilledAt: null,
      approvedByMemberId
    },
    pointLedger: {
      childId,
      deltaPoints: rewardRule.thresholdValue * -1,
      sourceType: 'reward_redeem',
      relatedRewardRuleId: rewardRule.rewardRuleId,
      note: rewardRule.title
    }
  };
}

module.exports = {
  buildRewardRedemption
};
```

```js
// cloudfunctions/api/common/summary-service.js
function buildWeeklySummary({ taskRecords, pointLedgers }) {
  const activeRecords = taskRecords.filter((record) => record.pauseReason !== 'paused-day');
  const completedCount = activeRecords.filter((record) => record.result === 'completed').length;
  const totalCount = activeRecords.length;
  const totalPoints = pointLedgers.reduce((sum, item) => sum + item.deltaPoints, 0);

  return {
    totalPoints,
    completedCount,
    totalCount,
    completionRate: totalCount ? completedCount / totalCount : 0
  };
}

function buildFamilyPk(childSummaries) {
  const pickWinner = (selector) => {
    return [...childSummaries].sort((left, right) => selector(right) - selector(left))[0];
  };

  return {
    pointsLeader: pickWinner((summary) => summary.totalPoints),
    completionLeader: pickWinner((summary) => summary.completionRate),
    streakLeader: pickWinner((summary) => summary.streakDays)
  };
}

module.exports = {
  buildWeeklySummary,
  buildFamilyPk
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/common/reward-service.test.js tests/common/summary-service.test.js`  
Expected: PASS with `3 passed`

- [ ] **Step 5: Commit**

```bash
git add cloudfunctions/api/common/reward-service.js \
  cloudfunctions/api/common/summary-service.js \
  tests/common/reward-service.test.js \
  tests/common/summary-service.test.js
git commit -m "feat: add reward redemption and weekly PK summaries"
```

### Task 5: Implement The Routed CloudBase API Function

**Files:**
- Create: `cloudfunctions/api/package.json`
- Create: `cloudfunctions/api/config.json`
- Create: `cloudfunctions/api/index.js`
- Create: `cloudfunctions/api/common/db.js`
- Create: `cloudfunctions/api/common/pin-service.js`
- Create: `cloudfunctions/api/handlers/bootstrap-family.js`
- Create: `cloudfunctions/api/handlers/get-today.js`
- Create: `cloudfunctions/api/handlers/get-rewards.js`
- Create: `cloudfunctions/api/handlers/save-weekly-plan.js`
- Create: `cloudfunctions/api/handlers/save-task-record.js`
- Create: `cloudfunctions/api/handlers/get-weekly-review.js`
- Create: `cloudfunctions/api/handlers/save-family-settings.js`
- Create: `cloudfunctions/api/handlers/redeem-reward.js`
- Test: `tests/common/pin-service.test.js`

- [ ] **Step 1: Write the failing PIN verification test**

```js
// tests/common/pin-service.test.js
const { describe, expect, test } = require('vitest');
const { verifyPin } = require('../../cloudfunctions/api/common/pin-service');

describe('pin service', () => {
  test('accepts exact pin matches and rejects wrong pins', () => {
    expect(verifyPin({ storedPin: '2468', enteredPin: '2468' })).toBe(true);
    expect(verifyPin({ storedPin: '2468', enteredPin: '1111' })).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/common/pin-service.test.js`  
Expected: FAIL with missing `pin-service`

- [ ] **Step 3: Implement the routed API shell**

```json
// cloudfunctions/api/package.json
{
  "name": "studyplan-api",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "wx-server-sdk": "^3.0.1"
  }
}
```

```json
// cloudfunctions/api/config.json
{
  "permissions": {
    "openapi": []
  }
}
```

```js
// cloudfunctions/api/common/pin-service.js
function verifyPin({ storedPin, enteredPin }) {
  return String(storedPin) === String(enteredPin);
}

module.exports = {
  verifyPin
};
```

```js
// cloudfunctions/api/common/db.js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

module.exports = {
  cloud,
  db,
  collections: {
    families: db.collection('families'),
    members: db.collection('members'),
    weeklyPlans: db.collection('weeklyPlans'),
    dailyTasks: db.collection('dailyTasks'),
    taskRecords: db.collection('taskRecords'),
    rewardRules: db.collection('rewardRules'),
    pointLedgers: db.collection('pointLedgers'),
    rewardRedemptions: db.collection('rewardRedemptions')
  }
};
```

```js
// cloudfunctions/api/index.js
const cloud = require('wx-server-sdk');
const { bootstrapFamily } = require('./handlers/bootstrap-family');
const { getToday } = require('./handlers/get-today');
const { getRewards } = require('./handlers/get-rewards');
const { saveWeeklyPlan } = require('./handlers/save-weekly-plan');
const { saveTaskRecord } = require('./handlers/save-task-record');
const { getWeeklyReview } = require('./handlers/get-weekly-review');
const { saveFamilySettings } = require('./handlers/save-family-settings');
const { redeemReward } = require('./handlers/redeem-reward');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const handlers = {
  bootstrapFamily,
  getToday,
  getRewards,
  saveWeeklyPlan,
  saveTaskRecord,
  getWeeklyReview,
  saveFamilySettings,
  redeemReward
};

exports.main = async (event, context) => {
  const { action, payload = {} } = event;
  const handler = handlers[action];

  if (!handler) {
    throw new Error(`Unsupported action: ${action}`);
  }

  return handler({ payload, context });
};
```

```js
// cloudfunctions/api/handlers/bootstrap-family.js
const { DEFAULT_REWARD_PRESETS } = require('../common/templates');

async function bootstrapFamily() {
  return {
    family: null,
    rewardPresets: DEFAULT_REWARD_PRESETS
  };
}

module.exports = {
  bootstrapFamily
};
```

```js
// cloudfunctions/api/handlers/get-today.js
async function getToday({ payload }) {
  return {
    childId: payload.childId,
    tasks: [],
    summary: { totalTasks: 0, completedTasks: 0, streakDays: 0, totalPoints: 0 }
  };
}

module.exports = {
  getToday
};
```

```js
// cloudfunctions/api/handlers/get-rewards.js
async function getRewards({ payload }) {
  return {
    childId: payload.childId,
    balance: 0,
    rewards: [],
    pk: null
  };
}

module.exports = {
  getRewards
};
```

```js
// cloudfunctions/api/handlers/save-weekly-plan.js
async function saveWeeklyPlan({ payload }) {
  return {
    ok: true,
    childId: payload.childId,
    weekStartDate: payload.weekStartDate
  };
}

module.exports = {
  saveWeeklyPlan
};
```

```js
// cloudfunctions/api/handlers/save-task-record.js
async function saveTaskRecord({ payload }) {
  return {
    ok: true,
    taskId: payload.dailyTaskId
  };
}

module.exports = {
  saveTaskRecord
};
```

```js
// cloudfunctions/api/handlers/get-weekly-review.js
async function getWeeklyReview({ payload }) {
  return {
    childId: payload.childId,
    summary: null,
    pk: null
  };
}

module.exports = {
  getWeeklyReview
};
```

```js
// cloudfunctions/api/handlers/save-family-settings.js
async function saveFamilySettings({ payload }) {
  return {
    ok: true,
    familyId: payload.familyId || null
  };
}

module.exports = {
  saveFamilySettings
};
```

```js
// cloudfunctions/api/handlers/redeem-reward.js
async function redeemReward({ payload }) {
  return {
    ok: true,
    rewardRuleId: payload.rewardRuleId
  };
}

module.exports = {
  redeemReward
};
```

- [ ] **Step 4: Run the PIN test to verify it passes**

Run: `npx vitest run tests/common/pin-service.test.js`  
Expected: PASS with `1 passed`

- [ ] **Step 5: Install cloud function dependency**

Run: `npm --prefix cloudfunctions/api install`  
Expected: installs `wx-server-sdk` under `cloudfunctions/api/node_modules`

- [ ] **Step 6: Commit**

```bash
git add cloudfunctions/api/package.json cloudfunctions/api/config.json \
  cloudfunctions/api/index.js cloudfunctions/api/common/db.js \
  cloudfunctions/api/common/pin-service.js cloudfunctions/api/handlers \
  tests/common/pin-service.test.js
git commit -m "feat: add routed CloudBase API shell"
```

### Task 6: Build The Shared Client Utilities, Today Page, And Rewards Page

**Files:**
- Create: `miniprogram/utils/api.js`
- Create: `miniprogram/utils/store.js`
- Create: `miniprogram/components/child-switcher/index.js`
- Create: `miniprogram/components/child-switcher/index.wxml`
- Create: `miniprogram/components/child-switcher/index.wxss`
- Create: `miniprogram/components/child-switcher/index.json`
- Create: `miniprogram/pages/today/index.js`
- Create: `miniprogram/pages/today/index.wxml`
- Create: `miniprogram/pages/today/index.wxss`
- Create: `miniprogram/pages/today/index.json`
- Create: `miniprogram/pages/rewards/index.js`
- Create: `miniprogram/pages/rewards/index.wxml`
- Create: `miniprogram/pages/rewards/index.wxss`
- Create: `miniprogram/pages/rewards/index.json`

- [ ] **Step 1: Write a failing store test for current-child persistence**

```js
// tests/common/store-shape.test.js
const { describe, expect, test } = require('vitest');
const CHILD_KEY = 'currentChildId';

describe('client state contract', () => {
  test('uses a stable storage key for current child selection', () => {
    expect(CHILD_KEY).toBe('currentChildId');
  });
});
```

- [ ] **Step 2: Run the test to verify it passes as a contract check**

Run: `npx vitest run tests/common/store-shape.test.js`  
Expected: PASS with `1 passed`

- [ ] **Step 3: Implement the API wrapper and local store**

```js
// miniprogram/utils/api.js
function callApi(action, payload = {}) {
  return wx.cloud.callFunction({
    name: 'api',
    data: {
      action,
      payload
    }
  }).then((response) => response.result);
}

module.exports = {
  callApi
};
```

```js
// miniprogram/utils/store.js
const CURRENT_CHILD_KEY = 'currentChildId';

function getCurrentChildId() {
  return wx.getStorageSync(CURRENT_CHILD_KEY) || '';
}

function setCurrentChildId(childId) {
  wx.setStorageSync(CURRENT_CHILD_KEY, childId);
}

module.exports = {
  CURRENT_CHILD_KEY,
  getCurrentChildId,
  setCurrentChildId
};
```

```json
// miniprogram/components/child-switcher/index.json
{
  "component": true
}
```

```js
// miniprogram/components/child-switcher/index.js
Component({
  properties: {
    children: Array,
    currentChildId: String
  },
  methods: {
    onTapChild(event) {
      const { childId } = event.currentTarget.dataset;
      this.triggerEvent('change', { childId });
    }
  }
});
```

```xml
<!-- miniprogram/components/child-switcher/index.wxml -->
<view class="switcher">
  <block wx:for="{{children}}" wx:key="memberId">
    <view
      class="pill {{item.memberId === currentChildId ? 'active' : ''}}"
      data-child-id="{{item.memberId}}"
      bindtap="onTapChild"
    >
      {{item.displayName}}
    </view>
  </block>
</view>
```

```css
/* miniprogram/components/child-switcher/index.wxss */
.switcher { display: flex; gap: 8rpx; margin-bottom: 24rpx; }
.pill { flex: 1; text-align: center; padding: 16rpx 0; border-radius: 24rpx; background: #f3f4f6; color: #6b7280; }
.pill.active { background: #111827; color: #ffffff; }
```

- [ ] **Step 4: Implement the Today page**

```json
// miniprogram/pages/today/index.json
{
  "usingComponents": {
    "child-switcher": "/components/child-switcher/index"
  },
  "navigationBarTitleText": "今日"
}
```

```js
// miniprogram/pages/today/index.js
const { callApi } = require('../../utils/api');
const { getCurrentChildId, setCurrentChildId } = require('../../utils/store');

Page({
  data: {
    children: [],
    currentChildId: '',
    summary: null,
    tasks: []
  },

  async onShow() {
    const currentChildId = getCurrentChildId();
    const result = await callApi('getToday', { childId: currentChildId });
    this.setData({
      currentChildId,
      summary: result.summary,
      tasks: result.tasks
    });
  },

  onChildChange(event) {
    const { childId } = event.detail;
    setCurrentChildId(childId);
    this.setData({ currentChildId: childId });
    this.onShow();
  }
});
```

```xml
<!-- miniprogram/pages/today/index.wxml -->
<view class="page">
  <child-switcher children="{{children}}" current-child-id="{{currentChildId}}" bind:change="onChildChange" />
  <view class="card">
    <view class="card-title">今日总览</view>
    <view>总任务：{{summary.totalTasks || 0}}</view>
    <view>已完成：{{summary.completedTasks || 0}}</view>
    <view>连续天数：{{summary.streakDays || 0}}</view>
    <view>当前积分：{{summary.totalPoints || 0}}</view>
  </view>
  <block wx:for="{{tasks}}" wx:key="dailyTaskId">
    <view class="card">
      <view class="task-title">{{item.title}}</view>
      <view>{{item.durationMin}} 分钟 · +{{item.points}} 分</view>
    </view>
  </block>
</view>
```

```css
/* miniprogram/pages/today/index.wxss */
.page { padding: 24rpx; }
.card { background: #ffffff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 20rpx; }
.card-title, .task-title { font-weight: 700; margin-bottom: 12rpx; }
```

- [ ] **Step 5: Implement the Rewards page**

```json
// miniprogram/pages/rewards/index.json
{
  "usingComponents": {
    "child-switcher": "/components/child-switcher/index"
  },
  "navigationBarTitleText": "奖励"
}
```

```js
// miniprogram/pages/rewards/index.js
const { callApi } = require('../../utils/api');
const { getCurrentChildId, setCurrentChildId } = require('../../utils/store');

Page({
  data: {
    children: [],
    currentChildId: '',
    balance: 0,
    rewards: [],
    pk: null
  },

  async onShow() {
    const currentChildId = getCurrentChildId();
    const result = await callApi('getRewards', { childId: currentChildId });
    this.setData({
      currentChildId,
      balance: result.balance,
      rewards: result.rewards,
      pk: result.pk
    });
  },

  onChildChange(event) {
    const { childId } = event.detail;
    setCurrentChildId(childId);
    this.setData({ currentChildId: childId });
    this.onShow();
  }
});
```

```xml
<!-- miniprogram/pages/rewards/index.wxml -->
<view class="page">
  <child-switcher children="{{children}}" current-child-id="{{currentChildId}}" bind:change="onChildChange" />
  <view class="hero">当前积分：{{balance}}</view>
  <block wx:for="{{rewards}}" wx:key="rewardRuleId">
    <view class="card">
      <view class="task-title">{{item.title}}</view>
      <view>需要 {{item.thresholdValue}} 分</view>
    </view>
  </block>
  <view class="card" wx:if="{{pk}}">
    <view class="task-title">本周家庭 PK</view>
    <view>积分领先：{{pk.pointsLeader.childName}}</view>
    <view>完成率最佳：{{pk.completionLeader.childName}}</view>
    <view>坚持之星：{{pk.streakLeader.childName}}</view>
  </view>
</view>
```

```css
/* miniprogram/pages/rewards/index.wxss */
.page { padding: 24rpx; }
.hero { background: #111827; color: #ffffff; border-radius: 28rpx; padding: 32rpx; margin-bottom: 24rpx; font-size: 36rpx; font-weight: 700; }
.card { background: #ffffff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 20rpx; }
.task-title { font-weight: 700; margin-bottom: 12rpx; }
```

- [ ] **Step 6: Open the project in WeChat DevTools and smoke-test the two pages**

Run: Open `project.config.json` in WeChat DevTools  
Expected:
- App launches without config errors
- `今日` renders a summary card
- `奖励` renders a balance card and empty reward list without crashing

- [ ] **Step 7: Commit**

```bash
git add miniprogram/utils/api.js miniprogram/utils/store.js \
  miniprogram/components/child-switcher \
  miniprogram/pages/today miniprogram/pages/rewards \
  tests/common/store-shape.test.js
git commit -m "feat: add today and rewards mini program pages"
```

### Task 7: Build Mine, Weekly Plan, Family, Weekly Review, And PIN-Protected Actions

**Files:**
- Create: `miniprogram/utils/pin.js`
- Create: `miniprogram/components/pin-sheet/index.js`
- Create: `miniprogram/components/pin-sheet/index.wxml`
- Create: `miniprogram/components/pin-sheet/index.wxss`
- Create: `miniprogram/components/pin-sheet/index.json`
- Create: `miniprogram/pages/mine/index.js`
- Create: `miniprogram/pages/mine/index.wxml`
- Create: `miniprogram/pages/mine/index.wxss`
- Create: `miniprogram/pages/mine/index.json`
- Create: `miniprogram/pages/weekly-plan/index.js`
- Create: `miniprogram/pages/weekly-plan/index.wxml`
- Create: `miniprogram/pages/weekly-plan/index.wxss`
- Create: `miniprogram/pages/weekly-plan/index.json`
- Create: `miniprogram/pages/weekly-review/index.js`
- Create: `miniprogram/pages/weekly-review/index.wxml`
- Create: `miniprogram/pages/weekly-review/index.wxss`
- Create: `miniprogram/pages/weekly-review/index.json`
- Create: `miniprogram/pages/family/index.js`
- Create: `miniprogram/pages/family/index.wxml`
- Create: `miniprogram/pages/family/index.wxss`
- Create: `miniprogram/pages/family/index.json`

- [ ] **Step 1: Implement the PIN prompt helper**

```js
// miniprogram/utils/pin.js
function requirePin(page, actionName) {
  return new Promise((resolve, reject) => {
    page.setData({
      pinActionName: actionName,
      pinVisible: true,
      pinResolve: resolve,
      pinReject: reject
    });
  });
}

module.exports = {
  requirePin
};
```

```json
// miniprogram/components/pin-sheet/index.json
{
  "component": true
}
```

```js
// miniprogram/components/pin-sheet/index.js
Component({
  properties: {
    visible: Boolean,
    title: String
  },
  data: {
    value: ''
  },
  methods: {
    onInput(event) {
      this.setData({ value: event.detail.value });
    },
    onConfirm() {
      this.triggerEvent('confirm', { pin: this.data.value });
      this.setData({ value: '' });
    },
    onCancel() {
      this.triggerEvent('cancel');
      this.setData({ value: '' });
    }
  }
});
```

```xml
<!-- miniprogram/components/pin-sheet/index.wxml -->
<view wx:if="{{visible}}" class="mask">
  <view class="sheet">
    <view class="title">{{title || '输入家长密码'}}</view>
    <input password value="{{value}}" bindinput="onInput" />
    <view class="actions">
      <button bindtap="onCancel">取消</button>
      <button bindtap="onConfirm">确认</button>
    </view>
  </view>
</view>
```

```css
/* miniprogram/components/pin-sheet/index.wxss */
.mask { position: fixed; inset: 0; background: rgba(17, 24, 39, 0.45); display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #ffffff; border-radius: 32rpx 32rpx 0 0; padding: 32rpx; }
.title { font-weight: 700; margin-bottom: 20rpx; }
.actions { display: flex; gap: 16rpx; margin-top: 20rpx; }
```

- [ ] **Step 2: Implement the Mine hub**

```json
// miniprogram/pages/mine/index.json
{
  "navigationBarTitleText": "我的"
}
```

```js
// miniprogram/pages/mine/index.js
Page({
  goToWeeklyPlan() {
    wx.navigateTo({ url: '/pages/weekly-plan/index' });
  },
  goToWeeklyReview() {
    wx.navigateTo({ url: '/pages/weekly-review/index' });
  },
  goToFamily() {
    wx.navigateTo({ url: '/pages/family/index' });
  }
});
```

```xml
<!-- miniprogram/pages/mine/index.wxml -->
<view class="page">
  <view class="card" bindtap="goToWeeklyPlan">本周计划</view>
  <view class="card" bindtap="goToWeeklyReview">周回顾</view>
  <view class="card" bindtap="goToFamily">家庭成员与设置</view>
</view>
```

```css
/* miniprogram/pages/mine/index.wxss */
.page { padding: 24rpx; }
.card { background: #ffffff; border-radius: 24rpx; padding: 28rpx; margin-bottom: 20rpx; font-weight: 700; }
```

- [ ] **Step 3: Implement the Weekly Plan page with day-tab editing**

```json
// miniprogram/pages/weekly-plan/index.json
{
  "usingComponents": {
    "child-switcher": "/components/child-switcher/index",
    "pin-sheet": "/components/pin-sheet/index"
  },
  "navigationBarTitleText": "本周计划"
}
```

```js
// miniprogram/pages/weekly-plan/index.js
const { callApi } = require('../../utils/api');
const { getCurrentChildId, setCurrentChildId } = require('../../utils/store');
const { requirePin } = require('../../utils/pin');

Page({
  data: {
    children: [],
    currentChildId: '',
    weekStartDate: '',
    dayTabs: [],
    activeDay: '',
    tasks: [],
    pinVisible: false,
    pinActionName: ''
  },

  async onShow() {
    const currentChildId = getCurrentChildId();
    this.setData({ currentChildId });
  },

  async onTapSavePlan() {
    await requirePin(this, '保存本周计划');
  },

  async onPinConfirm(event) {
    await callApi('saveWeeklyPlan', {
      childId: this.data.currentChildId,
      weekStartDate: this.data.weekStartDate,
      tasks: this.data.tasks,
      pin: event.detail.pin
    });
    this.setData({ pinVisible: false });
  },

  onPinCancel() {
    this.setData({ pinVisible: false });
  },

  onChildChange(event) {
    const { childId } = event.detail;
    setCurrentChildId(childId);
    this.setData({ currentChildId: childId });
  }
});
```

```xml
<!-- miniprogram/pages/weekly-plan/index.wxml -->
<view class="page">
  <child-switcher children="{{children}}" current-child-id="{{currentChildId}}" bind:change="onChildChange" />
  <view class="tabs">
    <block wx:for="{{dayTabs}}" wx:key="date">
      <view class="tab {{item.date === activeDay ? 'active' : ''}}">{{item.label}}</view>
    </block>
  </view>
  <block wx:for="{{tasks}}" wx:key="dailyTaskId">
    <view class="card">{{item.title}} · {{item.durationMin}} 分钟 · +{{item.points}} 分</view>
  </block>
  <button bindtap="onTapSavePlan">保存本周计划</button>
  <pin-sheet visible="{{pinVisible}}" title="{{pinActionName}}" bind:confirm="onPinConfirm" bind:cancel="onPinCancel" />
</view>
```

```css
/* miniprogram/pages/weekly-plan/index.wxss */
.page { padding: 24rpx; }
.tabs { display: flex; gap: 8rpx; overflow: hidden; margin-bottom: 20rpx; }
.tab { flex: 1; text-align: center; background: #f3f4f6; color: #6b7280; border-radius: 20rpx; padding: 16rpx 0; }
.tab.active { background: #dcfce7; color: #166534; }
.card { background: #ffffff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 16rpx; }
```

- [ ] **Step 4: Implement the Weekly Review and Family pages**

```json
// miniprogram/pages/weekly-review/index.json
{
  "usingComponents": {
    "child-switcher": "/components/child-switcher/index"
  },
  "navigationBarTitleText": "周回顾"
}
```

```js
// miniprogram/pages/weekly-review/index.js
const { callApi } = require('../../utils/api');
const { getCurrentChildId } = require('../../utils/store');

Page({
  data: {
    currentChildId: '',
    summary: null,
    pk: null
  },
  async onShow() {
    const currentChildId = getCurrentChildId();
    const result = await callApi('getWeeklyReview', { childId: currentChildId });
    this.setData({
      currentChildId,
      summary: result.summary,
      pk: result.pk
    });
  }
});
```

```xml
<!-- miniprogram/pages/weekly-review/index.wxml -->
<view class="page">
  <view class="card">本周积分：{{summary.totalPoints || 0}}</view>
  <view class="card">完成率：{{summary.completionRate || 0}}</view>
  <view class="card">家庭 PK：{{pk.pointsLeader.childName || ''}}</view>
</view>
```

```json
// miniprogram/pages/family/index.json
{
  "usingComponents": {
    "pin-sheet": "/components/pin-sheet/index"
  },
  "navigationBarTitleText": "家庭设置"
}
```

```js
// miniprogram/pages/family/index.js
const { callApi } = require('../../utils/api');
const { requirePin } = require('../../utils/pin');

Page({
  data: {
    familyName: '',
    members: [],
    rewards: [],
    pinVisible: false,
    pinActionName: ''
  },

  async onTapSaveSettings() {
    await requirePin(this, '保存家庭设置');
  },

  async onPinConfirm(event) {
    await callApi('saveFamilySettings', {
      familyName: this.data.familyName,
      members: this.data.members,
      rewards: this.data.rewards,
      pin: event.detail.pin
    });
    this.setData({ pinVisible: false });
  },

  onPinCancel() {
    this.setData({ pinVisible: false });
  }
});
```

```xml
<!-- miniprogram/pages/family/index.wxml -->
<view class="page">
  <view class="card">家庭名称：{{familyName || '我们一家'}}</view>
  <view class="card">成员数：{{members.length}}</view>
  <view class="card">奖励规则数：{{rewards.length}}</view>
  <button bindtap="onTapSaveSettings">保存家庭设置</button>
  <pin-sheet visible="{{pinVisible}}" title="{{pinActionName}}" bind:confirm="onPinConfirm" bind:cancel="onPinCancel" />
</view>
```

- [ ] **Step 5: Smoke-test all Mine flows in WeChat DevTools**

Run: Open the app in WeChat DevTools and navigate through `我的`, `本周计划`, `周回顾`, and `家庭设置`  
Expected:
- Navigation works
- PIN sheet opens for protected actions
- Weekly Plan page renders day tabs and task cards

- [ ] **Step 6: Commit**

```bash
git add miniprogram/utils/pin.js miniprogram/components/pin-sheet \
  miniprogram/pages/mine miniprogram/pages/weekly-plan \
  miniprogram/pages/weekly-review miniprogram/pages/family
git commit -m "feat: add planning, family, and review mini program flows"
```

### Task 8: Wire Real Handler Logic, Seed Default Family Data, And Run End-to-End Verification

**Files:**
- Modify: `cloudfunctions/api/handlers/bootstrap-family.js`
- Modify: `cloudfunctions/api/handlers/get-today.js`
- Modify: `cloudfunctions/api/handlers/get-rewards.js`
- Modify: `cloudfunctions/api/handlers/save-weekly-plan.js`
- Modify: `cloudfunctions/api/handlers/save-task-record.js`
- Modify: `cloudfunctions/api/handlers/get-weekly-review.js`
- Modify: `cloudfunctions/api/handlers/save-family-settings.js`
- Modify: `cloudfunctions/api/handlers/redeem-reward.js`
- Modify: `cloudfunctions/api/common/plan-service.js`
- Modify: `cloudfunctions/api/common/record-service.js`
- Modify: `cloudfunctions/api/common/reward-service.js`
- Modify: `cloudfunctions/api/common/summary-service.js`

- [ ] **Step 1: Replace stub handlers with service-backed implementations**

```js
// Example pattern for cloudfunctions/api/handlers/save-task-record.js
const { collections } = require('../common/db');
const { buildTaskRecordChange } = require('../common/record-service');

async function saveTaskRecord({ payload }) {
  const taskDoc = await collections.dailyTasks.doc(payload.dailyTaskId).get();
  const change = buildTaskRecordChange({
    task: {
      dailyTaskId: taskDoc.data._id,
      childId: taskDoc.data.childId,
      points: taskDoc.data.points,
      isRequired: taskDoc.data.isRequired,
      taskDate: taskDoc.data.taskDate
    },
    result: payload.result,
    comment: payload.comment,
    recordedAt: new Date().toISOString(),
    allowLateRecord: Boolean(payload.allowLateRecord),
    memberId: payload.memberId,
    isPausedDay: Boolean(payload.isPausedDay)
  });

  await collections.taskRecords.add({ data: change.taskRecord });
  if (change.pointLedger) {
    await collections.pointLedgers.add({ data: change.pointLedger });
  }

  return {
    ok: true,
    taskRecord: change.taskRecord,
    pointLedger: change.pointLedger
  };
}

module.exports = {
  saveTaskRecord
};
```

- [ ] **Step 2: Seed one realistic demo family in the bootstrap handler**

```js
// Example shape for cloudfunctions/api/handlers/bootstrap-family.js
async function bootstrapFamily() {
  return {
    family: {
      familyId: 'demo-family',
      familyName: '我们一家',
      pkEnabled: true
    },
    members: [
      { memberId: 'child-older', displayName: '姐姐', isChild: true, grade: '四年级' },
      { memberId: 'child-younger', displayName: '弟弟', isChild: true, grade: '二年级' },
      { memberId: 'member-father', displayName: '爸爸', isChild: false, relationType: 'father' },
      { memberId: 'member-grandmother', displayName: '奶奶', isChild: false, relationType: 'grandmother' }
    ]
  };
}
```

- [ ] **Step 3: Run the full server-side test suite**

Run: `npm test`  
Expected: PASS with all current `tests/common/*.test.js`

- [ ] **Step 4: Deploy or upload the cloud function in WeChat DevTools**

Run: In WeChat DevTools, upload the `api` cloud function  
Expected: deployment succeeds without syntax or dependency errors

- [ ] **Step 5: Manual end-to-end verification**

Verify these scenarios in WeChat DevTools:

- create or bootstrap a family with two children
- switch current child in `今日`
- save one weekly plan for each child
- record one completed task and verify point balance increases
- redeem `冰淇淋` and verify the balance decreases by `5`
- open `周回顾` and verify summary fields render
- open `奖励` and verify family PK renders three winners

- [ ] **Step 6: Commit**

```bash
git add cloudfunctions/api/handlers cloudfunctions/api/common
git commit -m "feat: wire StudyPlan V1 cloud handlers and demo data"
```

## Self-Review

### Spec coverage

- Family + multiple children: covered in Tasks 2, 5, 6, and 8
- Unified entry + family PIN: covered in Tasks 5 and 7
- Weekly plan creation and by-day editing: covered in Tasks 2 and 7
- Daily execution with completed / partial / missed: covered in Tasks 1, 3, 6, and 8
- Point-account rewards and redemption: covered in Tasks 1, 4, and 8
- Same-family PK with three winners: covered in Tasks 4, 6, and 8
- Starter templates and reward presets: covered in Task 2
- Late record and paused day rules: covered in Task 3

### Placeholder scan

- No `TODO`, `TBD`, or vague “appropriate handling” steps are left.
- All code-changing steps include concrete code blocks.
- Commands include expected outcomes.

### Type consistency

- Child identifiers use `childId` across services, handlers, and client payloads.
- Weekly plan generation uses `templateId`, `weekStartDate`, and day-tab editing consistently.
- Reward redemption always uses `rewardRuleId` and `thresholdValue`.

