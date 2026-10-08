const { db } = require('../services/db');
const repo = require('../services/repository');
const { ALL_CATEGORIES, CATEGORY_LABELS } = require('../config/paymentCategories');
const { EXPENSE_CATEGORIES } = require('../config/expenseCategories');
const { buildLedger, round2, sumAmount } = require('../services/ledger');
const { pad, resolvePeriod } = require('../utils/period');
const { sendResponse } = require('../utils/response');

const emptyCategoryTotals = () => Object.fromEntries(ALL_CATEGORIES.map((category) => [category, 0]));

// Every rupee received in the period, from seva bookings and from the other receipts.
const loadLedger = async (period) => {
  const [bookings, sevas, receipts] = await Promise.all([
    repo.listBookingsBetween(db, period.from, period.to),
    repo.listSevas(db),
    repo.listReceiptsBetween(db, period.from, period.to),
  ]);

  return buildLedger({ bookings, sevas, receipts });
};

const groupTotals = (rows, key) =>
  Object.values(
    rows.reduce((accumulator, row) => {
      accumulator[row[key]] ??= { [key]: row[key], amount: 0, count: 0 };
      accumulator[row[key]].amount = round2(accumulator[row[key]].amount + row.amount);
      accumulator[row[key]].count += row.count ?? 1;
      return accumulator;
    }, {}),
  ).sort((left, right) => right.amount - left.amount);

// The five expenditure heads always appear (zero when unused), followed by any legacy category that
// still exists on older records.
const withAllExpenseCategories = (rows) => {
  const known = EXPENSE_CATEGORIES.map((category) => rows.find((row) => row.category === category) ?? { category, amount: 0, count: 0 });
  const legacy = rows.filter((row) => !EXPENSE_CATEGORIES.includes(row.category));
  return [...known, ...legacy];
};

const categorySummary = (entries) =>
  ALL_CATEGORIES.map((category) => {
    const matching = entries.filter((entry) => entry.category === category);
    return { category, label: CATEGORY_LABELS[category], amount: sumAmount(matching), count: matching.length };
  });

const getOverview = async (req, res) => {
  const period = resolvePeriod({ year: req.query.year });
  const [summary, ledger] = await Promise.all([repo.getFinanceSummary(db, period.from, period.to), loadLedger(period)]);

  const months = Array.from({ length: 12 }, (_, index) => {
    const key = `${period.year}-${pad(index + 1)}`;
    const entries = ledger.entries.filter((entry) => entry.date.startsWith(key));
    const debit = summary.debits.find((item) => item.month === key);
    const categories = emptyCategoryTotals();
    entries.forEach((entry) => {
      categories[entry.category] = round2(categories[entry.category] + entry.amount);
    });
    const debitCategories = Object.fromEntries(EXPENSE_CATEGORIES.map((category) => [category, 0]));
    summary.expenseCategories
      .filter((row) => row.month === key)
      .forEach((row) => {
        debitCategories[row.category] = round2((debitCategories[row.category] ?? 0) + row.amount);
      });

    const credits = sumAmount(entries);
    const debits = round2(debit?.amount ?? 0);

    return {
      month: key,
      credits,
      debits,
      profit: round2(credits - debits),
      categories,
      debitCategories,
      entries: entries.length,
      expenses: debit?.count ?? 0,
    };
  });

  const totalCredits = sumAmount(months.map((month) => ({ amount: month.credits })));
  const totalDebits = sumAmount(months.map((month) => ({ amount: month.debits })));
  const years = [...new Set([new Date().getFullYear(), period.year, ...summary.years])].sort((a, b) => b - a);

  return sendResponse(res, 200, 'Finance overview fetched successfully', {
    year: period.year,
    availableYears: years,
    months,
    totals: {
      credits: totalCredits,
      debits: totalDebits,
      profit: round2(totalCredits - totalDebits),
      entries: ledger.entries.length,
      expenses: months.reduce((sum, month) => sum + month.expenses, 0),
    },
    categories: categorySummary(ledger.entries),
    paymentModes: groupTotals(ledger.entries, 'paymentMode'),
    expenseCategories: withAllExpenseCategories(
      groupTotals(summary.expenseCategories.map((row) => ({ category: row.category, amount: row.amount, count: 1 })), 'category'),
    ),
  });
};

// Every receipt of a period grouped under the way it was paid; optionally narrowed to one category.
const getPayments = async (req, res) => {
  const period = resolvePeriod(req.query);
  const ledger = await loadLedger(period);
  const entries = req.query.category ? ledger.entries.filter((entry) => entry.category === req.query.category) : ledger.entries;

  const groups = Object.values(
    entries.reduce((accumulator, entry) => {
      const group = (accumulator[entry.paymentMode] ??= { paymentMode: entry.paymentMode, count: 0, total: 0, entries: [] });
      group.count += 1;
      group.total = round2(group.total + entry.amount);
      group.entries.push({ ...entry, categoryLabel: CATEGORY_LABELS[entry.category] });
      return accumulator;
    }, {}),
  ).sort((left, right) => right.total - left.total);

  return sendResponse(res, 200, 'Payments fetched successfully', {
    year: period.year,
    month: period.month,
    category: req.query.category || null,
    cancelledEntries: ledger.cancelled,
    totalCollected: sumAmount(entries),
    totalEntries: entries.length,
    // The summary is always for the whole period, so the category chips stay visible while filtering.
    categories: categorySummary(ledger.entries),
    groups,
  });
};

const getExpenditures = async (req, res) => {
  const period = resolvePeriod(req.query);
  const items = await repo.listExpendituresBetween(db, period.from, period.to);

  const byCategory = Object.values(
    items.reduce((accumulator, item) => {
      accumulator[item.expenseCategory] ??= { category: item.expenseCategory, amount: 0, count: 0 };
      accumulator[item.expenseCategory].amount += item.expenseAmount;
      accumulator[item.expenseCategory].count += 1;
      return accumulator;
    }, {}),
  );

  return sendResponse(res, 200, 'Expenditures fetched successfully', {
    year: period.year,
    month: period.month,
    total: round2(items.reduce((sum, item) => sum + item.expenseAmount, 0)),
    byCategory: withAllExpenseCategories(byCategory),
    items,
  });
};

// Expenditure as flat accounting entries (same four fields as the receipts export), one per expense.
// Particulars is the expenditure head: Maintenance, Salaries, Daily Expenses, Dakshine and Sambhavane
// or Donation Paid.
const getExpenditureExport = async (req, res) => {
  const period = resolvePeriod(req.query);
  const items = await repo.listExpendituresBetween(db, period.from, period.to);

  const records = [...items]
    .sort((left, right) => left.expenseDate.localeCompare(right.expenseDate))
    .map((item) => ({
      date: item.expenseDate,
      particulars: item.expenseCategory,
      modeOfPayment: item.paymentMode,
      amount: round2(item.expenseAmount),
    }));

  await repo.insertAuditLog(
    db,
    'EXPORT',
    'finance',
    { format: 'tally-json', kind: 'expenditure', year: period.year, month: period.month, entries: records.length },
    req.user.email,
  );

  return sendResponse(res, 200, 'Export generated successfully', records);
};

// Receipts as flat accounting entries for import into Tally / audit files. Each record has exactly:
//   date (YYYY-MM-DD), particulars (payment category), modeOfPayment, amount.
// Particulars is one of: Religious Seva, Annadana Seva, Donation, Hundi Collection.
const getTallyExport = async (req, res) => {
  const period = resolvePeriod(req.query);
  const ledger = await loadLedger(period);
  const selected = req.query.category ? ledger.entries.filter((entry) => entry.category === req.query.category) : ledger.entries;

  const records = selected.map((entry) => ({
    date: entry.date,
    particulars: CATEGORY_LABELS[entry.category],
    modeOfPayment: entry.paymentMode,
    amount: entry.amount,
  }));

  await repo.insertAuditLog(
    db,
    'EXPORT',
    'finance',
    { format: 'tally-json', year: period.year, month: period.month, category: req.query.category || null, entries: records.length },
    req.user.email,
  );

  return sendResponse(res, 200, 'Export generated successfully', records);
};

module.exports = { getOverview, getPayments, getExpenditures, getTallyExport, getExpenditureExport };
