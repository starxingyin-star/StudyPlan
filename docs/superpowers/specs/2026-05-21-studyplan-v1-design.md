# StudyPlan V1 Design

## Overview

StudyPlan V1 is a WeChat Mini Program for families to help children build stable study habits. The first release focuses on one family using the product daily, with room to expand later to more complete planning and broader sharing.

V1 is intentionally narrow:

- Main habit goals: `练字`, `朗读`
- Main operators: parents and grandparents
- Children mainly view rewards, progress, and positive feedback
- Multiple children in one family are supported from day one
- Rewards work like a savings account: tasks earn points, rewards spend points

## Goals

- Help a family consistently execute simple study habits without relying on ad hoc reminders and arguments.
- Help children build stable habits before optimizing for broad academic management.
- Make daily recording fast enough for grandparents to use.
- Keep each child's plan, points, streaks, and weekly summary separate.
- Support light family-internal competition without creating a harsh ranking system.

## Non-Goals For V1

- No cross-family competition.
- No formal role-based login split between parent and child.
- No AI-generated plans as the primary path.
- No heavy analytics, curriculum intelligence, or teacher-facing features.
- No separate admin website.

## Product Principles

- One shared app entry. Do not ask the user to choose parent mode vs child mode on launch.
- Sensitive actions are protected by a family PIN, not by switching identities.
- Daily execution and weekly planning are separate surfaces.
- Reward feedback must feel encouraging, not administrative.
- V1 should favor consistency and clarity over flexibility and feature count.

## Primary Users

### Family

One family is the primary product container. A family includes:

- Multiple adult members: father, mother, grandfather, grandmother, guardian
- One or more children
- A family-level PIN
- Family-level reward settings and PK settings

### Adults

Adults use the app to:

- Create and edit weekly plans
- Record daily completion
- Approve reward redemption
- Review weekly progress

### Children

Children use the app occasionally to:

- View today's progress
- View point totals and streaks
- View available rewards and badges
- View family PK results

## Information Architecture

V1 uses 3 top-level tabs:

1. `今日`
2. `奖励`
3. `我的`

### 今日

Purpose: daily execution and recording.

Contains:

- Current child switcher
- Today's overview
- Today's task list
- Record completion actions
- Short encouraging feedback

Does not contain:

- Weekly plan editing
- Reward rule editing
- Family member management

### 奖励

Purpose: child-facing motivation and light family competition.

Contains:

- Current child points balance
- Current child streak
- Reward grid/list
- Available badges
- Family-internal PK block

### 我的

Purpose: setup, planning, review, and settings.

Contains 4 second-level entries:

1. `本周计划`
2. `周回顾`
3. `家庭成员与设置`
4. `奖励规则`

## Core Flows

### First-Time Setup

1. Open app.
2. Go to `我的 > 家庭成员与设置`.
3. Create family.
4. Add adult members.
5. Add one or more children.
6. Set child grade and focus habits.
7. Set family PIN.
8. Configure initial reward rules.

### Weekly Planning

1. Go to `我的 > 本周计划`.
2. Choose current child.
3. If no weekly plan exists, show `创建本周计划`.
4. Choose a template.
5. Generate a draft weekly plan.
6. Edit by day using day tabs.
7. Add tasks from task library or create custom tasks.
8. Save the weekly plan.

### Daily Recording

1. Open `今日`.
2. Choose current child.
3. Review today's overview and tasks.
4. Record task result:
   - completed
   - partial
   - missed
5. Optionally add a short note.
6. Save record.
7. Update child point balance and progress.

### Reward Redemption

1. Child views available rewards in `奖励`.
2. Adult or child initiates a redemption request.
3. System checks point balance or streak requirement.
4. Adult confirms via PIN if needed.
5. Reward is marked approved and then fulfilled.
6. Points are deducted only when the reward is approved.

### Weekly Review

1. Go to `我的 > 周回顾`.
2. Choose current child.
3. Review:
   - weekly points
   - completion rate
   - streak status
   - habit completion counts
4. Decide whether to keep, reduce, or adjust next week's task intensity.

## Weekly Plan Model

### Planning Scope

Weekly plans are child-level, not family-level.

If a family has two children, there are two separate weekly plans for the same calendar week.

### Editing Mode

V1 uses `按天切换编辑`.

Users:

- pick a child first
- pick a day tab
- edit only that day's tasks

This is clearer than whole-week drag-and-drop for the first release.

### Supported Task Sources

- template-generated tasks
- task library tasks
- custom manual tasks

### Convenience Actions

V1 supports:

- `复制昨天`
- `复制到工作日`
- `下周沿用本周再修改`

## Task Types

V1 supports these task types:

- `habit`: recurring habits like 练字, 朗读
- `study`: study tasks like 阅读, 口算, 背诵
- `class`: extracurricular classes
- `custom`: freeform family-defined tasks

## Reward System

### Core Model

Points behave like a savings account.

- Completing tasks adds points to the child's balance
- Redeeming rewards subtracts points from the child's balance
- Weekly perfect completion can grant bonus points

### Default Point Rules

V1 supports per-task point values:

- easy task: `1`
- medium task: `2`
- hard task: `3`

Families may override these values per task.

### Completion Scoring

V1 rules:

- `completed`: full points
- `partial`: `0` points, but record is saved
- `missed`: `0` points

This keeps the point system integer-based and easy for children to understand.

### Streak Rules

A day counts toward streak only when all required tasks for that child on that day are marked `completed`.

`partial` does not count toward streak continuation.

### Weekly Bonus

If all required tasks for a child are completed for the full week, award a configurable weekly bonus.

Default V1 weekly perfect-completion bonus: `+5` points.

### Reward Types

V1 reward rules support:

- `time`: e.g. 看电视 30 分钟
- `experience`: e.g. 游乐场, 选周末活动
- `item`: e.g. 冰淇淋, 玩具, 小礼物
- `privilege`: e.g. 选晚饭, 晚睡 30 分钟
- `badge`: e.g. 朗读小达人

### Reward Examples

Examples for the first family setup:

- 冰淇淋: `5` points
- 看电视 30 分钟: `8` points
- 小玩具: `15` points
- 游乐场: `30` points

These are defaults only and remain configurable.

## Family-Internal PK

### Scope

PK is family-internal only.

- only compares children in the same family
- no cross-family ranking
- no public leaderboard

### Dimensions

V1 compares three dimensions:

1. total points
2. completion rate
3. streak / persistence

### Presentation

Do not show one harsh total ranking.

Instead, show three small champions:

- 本周积分领先
- 本周完成率最佳
- 本周坚持之星

This creates competition without making one child permanently "the winner".

### Fairness

Because different children may have different grades and task difficulty:

- `completion rate` is the fairest primary indicator
- `total points` is a secondary indicator
- `streak` highlights persistence

### PK Rewards

PK rewards are light in V1:

- badge
- small bonus points
- small family privilege

V1 should not tie PK to heavy rewards.

### PK Controls

Family settings include:

- PK on/off
- dimension visibility

## Unified Entry And PIN Model

V1 does not ask the user to choose an identity on launch.

Instead:

- all users open the same app entry
- adults switch the current child when needed
- sensitive actions require the family PIN

PIN-protected actions:

- edit weekly plan
- change reward rules
- revoke task record
- manually adjust points
- approve reward redemption

## Edge Rules Needed For Closure

### Week Activation

If a new week starts and no weekly plan exists for a child:

- show `复制上周并微调`
- allow the adult to create the new plan from the previous week

### Midweek Changes

Editing future tasks in the current week is allowed.

Editing a past day with existing records requires PIN.

### Late Recording

V1 allows late recording for the previous day only.

- allowed window: `1 day`
- requires family PIN
- late-recorded tasks do not restore streaks retroactively by default

This keeps streaks trustworthy and avoids backfilling abuse.

### Pause / Leave Day

Adults can mark a child's day as `paused`.

Paused days:

- do not count as missed
- do not award points
- do not break streaks

Use cases:

- illness
- travel
- special family schedule

### Multi-Child Safety

To reduce wrong-child recording:

- `今日` always shows current child prominently
- recording confirmation must display child name
- child switch persists locally until changed

## Core Data Model

### Family

- `familyId`
- `familyName`
- `parentPinHash`
- `pkEnabled`
- `createdAt`
- `updatedAt`

### Member

- `memberId`
- `familyId`
- `displayName`
- `relationType`
- `isChild`
- `grade`
- `focusHabits`
- `isActive`

Children are stored as members with `isChild = true`.

### WeeklyPlan

- `weeklyPlanId`
- `familyId`
- `childId`
- `weekStartDate`
- `templateId`
- `status` (`draft`, `active`, `archived`)
- `focusHabits`
- `copiedFromWeeklyPlanId`
- `createdAt`
- `updatedAt`

### DailyTask

- `dailyTaskId`
- `weeklyPlanId`
- `familyId`
- `childId`
- `taskDate`
- `taskType`
- `title`
- `durationMin`
- `points`
- `instructions`
- `sortOrder`
- `sourceType`
- `isRequired`
- `isEnabled`

### TaskRecord

- `taskRecordId`
- `dailyTaskId`
- `familyId`
- `childId`
- `taskDate`
- `result`
- `pointsAwarded`
- `comment`
- `recordedByMemberId`
- `recordedAt`
- `isLateRecord`
- `revokedAt`
- `revokedByMemberId`

### RewardRule

- `rewardRuleId`
- `familyId`
- `scopeType` (`family`, `child`)
- `childId`
- `rewardType`
- `title`
- `unlockMode` (`points`, `streak`, `manual`)
- `thresholdValue`
- `enabled`
- `sortOrder`

### PointLedger

- `pointLedgerId`
- `familyId`
- `childId`
- `deltaPoints`
- `sourceType`
- `relatedTaskId`
- `relatedRewardRuleId`
- `note`
- `createdByMemberId`
- `createdAt`

### RewardRedemption

- `redemptionId`
- `familyId`
- `childId`
- `rewardRuleId`
- `status` (`requested`, `approved`, `fulfilled`, `cancelled`)
- `pointsSpent`
- `requestedAt`
- `approvedAt`
- `fulfilledAt`
- `approvedByMemberId`

## Technical Architecture

### Stack

- WeChat Mini Program
- CloudBase / WeChat Cloud Development

Use:

- cloud database
- cloud functions
- built-in auth/session capability where useful
- cloud storage if image proof is added later

### Why This Stack

- No traditional server purchase for V1
- Faster AI-assisted development
- Low ops burden
- Enough backend capability for a family-scale product

### Client Responsibilities

- child switch state
- page rendering
- local optimistic feedback
- PIN entry for sensitive actions

### Cloud Function Responsibilities

- weekly plan generation from template
- task record save and validation
- point ledger updates
- reward redemption workflow
- weekly summary calculation
- PK result calculation

## Data Flow

### Daily Record

1. user opens current child in `今日`
2. user records result
3. client submits to cloud function
4. function validates child, task, date, PIN if needed
5. function writes `TaskRecord`
6. function writes `PointLedger` if points are awarded
7. function returns new balances and summary snippet

### Weekly Summary

V1 computes summary from source records, rather than storing a separate authoritative summary table.

Computed outputs:

- weekly points
- completion rate
- streak status
- habit counts
- family PK results

## Error Handling

V1 should explicitly handle:

- missing weekly plan
- wrong-child recording confirmation
- duplicate task recording
- insufficient points for redemption
- invalid PIN for protected actions
- late-record window expired
- paused day conflicts

When possible, errors should offer next steps:

- create or copy weekly plan
- switch current child
- enter PIN
- return to reward list

## Verification And Testing

### Product-Level Test Cases

- one family with one child
- one family with two children
- create weekly plan from template
- edit tasks by day
- record completed / partial / missed
- apply weekly perfect bonus
- redeem a reward and deduct points
- pause a day without breaking streak
- calculate family PK correctly

### Usability Checks

- grandparents can record a task within 30 seconds
- adults can find weekly planning without searching
- children can understand point balance and reward cost

### Residual Risks

- If pause and late-record rules are ignored, streaks and PK will lose credibility quickly.
- If total points are over-emphasized in PK, older children may dominate.
- If planning becomes too flexible too early, V1 will become harder for grandparents to use.

## V1 Final Operating Rules

This section defines the default family rules needed to make V1 usable in real life. These are product defaults, not immutable hard rules. Families may tune them later, but V1 should ship with a complete starting system.

### 1. Initial Task Templates

V1 starts with a small task template library so families do not create every task from scratch.

#### Lower-grade habit template

Recommended defaults for a lower-grade child:

- 练字: 10-15 minutes
- 朗读: 10 minutes
- 阅读: 15-20 minutes
- 口算: 10 minutes

#### Older-child study template

Recommended defaults for an older child:

- 阅读: 20 minutes
- 口算: 10-15 minutes
- 英语朗读: 10 minutes
- 课外班复盘: 5-10 minutes

#### Weekly planning default

For each child, the default weekly plan should:

- place `练字` and `朗读` on weekday slots by default if selected as focus habits
- allow lighter or no required tasks on weekends unless the family explicitly adds them
- start narrow rather than overload the child

### 2. Point Economy Defaults

V1 must provide a simple, intuitive point economy from day one.

#### Task point levels

- easy task: `1` point
- medium task: `2` points
- hard task: `3` points

Examples:

- 朗读 10 分钟: `1`
- 练字 15 分钟: `2`
- 口算 10 分钟: `2`
- 高难度额外复习任务: `3`

#### Weekly bonus

If a child completes all required tasks for the week:

- perfect week bonus: `+5` points

If the family wants stronger weekly reinforcement later, that can be tuned, but V1 should start conservative.

#### Reward price defaults

Suggested starting reward prices:

- 冰淇淋: `5` points
- 看电视 30 分钟: `8` points
- 小玩具: `15` points
- 游乐场: `30` points

These examples should be included as starter presets in V1.

#### Balance philosophy

Points should feel like savings, not disposable daily tokens.

- task completion adds to a persistent point balance
- reward redemption subtracts from that balance
- point history remains auditable through the ledger

### 3. Family Operating Roles

The app cannot replace family discipline. V1 should be designed around a default execution rhythm.

#### Weekly responsibility

- Sunday evening: parent reviews weekly summary and creates or adjusts the next week's plan

#### Weekday responsibility

- Monday to Friday: grandparents or parents record task completion

#### Reward responsibility

- parents confirm redemption and fulfillment of rewards

This default rhythm should be reflected in copy and onboarding, because clarity of responsibility is essential for habit consistency.

### 4. Completion Quality Rules

V1 needs simple completion standards to avoid family conflict and inconsistent scoring.

#### Default standard

Each task can be marked:

- completed
- partial
- missed

#### Suggested interpretation

- `completed`: the child finished the expected task in a basically acceptable way
- `partial`: the child attempted it but did not meet the expected level or time
- `missed`: the task was not meaningfully done

#### Habit-specific guidance

V1 should include suggested family guidance for common tasks:

- 朗读 completed: read the assigned content for the intended duration with reasonable engagement
- 练字 completed: completed the assigned writing amount, not merely sat with the workbook open

These are not machine-enforced rules, but they should appear in task instructions or onboarding guidance.

### 5. PK Boundaries And Safety Rules

PK is intended to create positive momentum, not shame.

#### V1 PK boundaries

- only compare children inside the same family
- no public ranking outside the family
- no negative labels like last place or failure
- no red/black leaderboard

#### Display style

Use positive multi-dimension recognition:

- 本周积分领先
- 本周完成率最佳
- 本周坚持之星

#### Family control

Families can:

- disable PK entirely
- keep PK visible but make rewards independent from PK

This keeps competition optional and healthy.

## Next Phase After V1

V2 may expand into a fuller study planner:

- more subjects and class schedules
- stronger summaries
- more reusable templates

V3 may expand toward a shareable product:

- broader family onboarding
- richer templates and monetization
- optional AI plan generation
