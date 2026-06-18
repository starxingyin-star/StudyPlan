function pad2(value) {
  return String(value).padStart(2, '0');
}

function formatLocalDate(date) {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate())
  ].join('-');
}

function parseLocalDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getWeekStartDate(base = new Date()) {
  const date = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return formatLocalDate(date);
}

function buildDayTabs(weekStartDate) {
  const labels = ['一', '二', '三', '四', '五', '六', '日'];
  const base = parseLocalDate(weekStartDate);

  return labels.map((label, index) => {
    const current = new Date(base);
    current.setDate(base.getDate() + index);
    return {
      date: formatLocalDate(current),
      label
    };
  });
}

module.exports = {
  buildDayTabs,
  formatLocalDate,
  getWeekStartDate
};
