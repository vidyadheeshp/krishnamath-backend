const { financialYearLabel, todayInIndia } = require('./dates');

// Every receipt carries a number like PAT-BGM-2627-000001: the temple code, the financial year
// (2627 = April 2026 - March 2027) and a running number that starts again at 000001 each financial year.
const RECEIPT_PREFIX = 'PAT-BGM';

const formatReceiptNumber = (financialYear, sequence) =>
  `${RECEIPT_PREFIX}-${financialYear}-${String(sequence).padStart(6, '0')}`;

// The financial year a receipt falls in is decided by the day it is issued (in India), not the seva date.
const currentFinancialYear = (now = new Date()) => financialYearLabel(todayInIndia(now));

module.exports = { RECEIPT_PREFIX, formatReceiptNumber, currentFinancialYear };
