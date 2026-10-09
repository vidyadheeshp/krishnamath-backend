// The temple works in Indian time, whatever time zone the server itself runs in.
const TIME_ZONE = 'Asia/Kolkata';

// Today's date in India as YYYY-MM-DD (en-CA formats dates that way).
const todayInIndia = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);

// Adds (or subtracts) whole days to a YYYY-MM-DD date, without any time-zone surprises.
const addDays = (isoDate, days) => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

// Indian financial year (1 April - 31 March) of a date as a 4-digit label: 2026-10-09 -> "2627".
const financialYearLabel = (isoDate = todayInIndia()) => {
  const [year, month] = isoDate.split('-').map(Number);
  const startYear = month >= 4 ? year : year - 1;
  return `${String(startYear % 100).padStart(2, '0')}${String((startYear + 1) % 100).padStart(2, '0')}`;
};

module.exports = { TIME_ZONE, todayInIndia, addDays, financialYearLabel };
