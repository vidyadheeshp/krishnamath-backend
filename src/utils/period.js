const pad = (value) => String(value).padStart(2, '0');

// Resolves ?year=&month= into a half-open date range [from, to). Month is optional (whole year when absent).
const resolvePeriod = (query) => {
  const year = Number(query.year) || new Date().getFullYear();
  const month = query.month ? Number(query.month) : null;

  if (month) {
    const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
    return { year, month, from: `${year}-${pad(month)}-01`, to: `${next.year}-${pad(next.month)}-01` };
  }

  return { year, month: null, from: `${year}-01-01`, to: `${year + 1}-01-01` };
};

module.exports = { resolvePeriod, pad };
