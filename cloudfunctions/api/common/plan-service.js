const { DEFAULT_TASK_LIBRARY, TEMPLATES } = require('./templates');

function addDays(isoDate, offset) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function normalizeTasksForDay({ childId, currentDate, tasks }) {
  return tasks.map((task, index) => ({
    ...task,
    taskDate: currentDate,
    childId,
    sortOrder: index + 1,
    sourceType: task.sourceType || 'manual'
  }));
}

function buildWeeklyPlanDraft({ childId, weekStartDate, templateId, focusHabits, tasksByDay = {} }) {
  const template = TEMPLATES[templateId];
  const weekdayTitles = template.weekdayTaskTitles.filter((title) => {
    return !focusHabits.length || focusHabits.includes(title) || title === '课外班';
  });
  const days = {};

  for (let offset = 0; offset < 7; offset += 1) {
    const currentDate = addDays(weekStartDate, offset);
    const isWeekend = offset >= 5;

    if (Array.isArray(tasksByDay[currentDate])) {
      days[currentDate] = normalizeTasksForDay({
        childId,
        currentDate,
        tasks: tasksByDay[currentDate]
      });
      continue;
    }

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
