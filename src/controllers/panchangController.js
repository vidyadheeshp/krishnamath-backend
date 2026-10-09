const { getPanchang, MAX_DAYS } = require('../services/panchang');
const { HttpError } = require('../utils/httpError');
const { sendResponse } = require('../utils/response');

// Panchang for the days from ?from up to (not including) ?to, as { date: details }.
const listPanchang = async (req, res) => {
  const { from, to } = req.query;
  const days = (new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000;

  if (!(days > 0 && days <= MAX_DAYS)) {
    throw new HttpError(400, `Ask for between 1 and ${MAX_DAYS} days at a time`);
  }

  return sendResponse(res, 200, 'Panchang fetched successfully', await getPanchang(from, to));
};

module.exports = { listPanchang };
