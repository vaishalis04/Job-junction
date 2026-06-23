// helpers/dateFilter.helper.js

function getDateCutoff(datePosted) {
  if (!datePosted) return null;

  const now = new Date();
  const map = {
    last_24_hours: 1,
    last_3_days:   3,
    last_week:     7,
    last_2_weeks:  14,
    last_month:    30,
  };

  const days = map[datePosted];
  if (!days) return null;

  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

module.exports = { getDateCutoff };