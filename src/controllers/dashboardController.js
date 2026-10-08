const { db } = require('../services/db');
const repo = require('../services/repository');
const { sendResponse } = require('../utils/response');

const getDashboard = async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);

  const [totals, notifications] = await Promise.all([
    repo.getDashboardTotals(db, today),
    repo.listNotifications(db, 5),
  ]);

  return sendResponse(res, 200, 'Dashboard fetched successfully', {
    stats: {
      currentDayBookings: totals.currentDayBookings,
      totalDevoteesVisited: totals.totalDevoteesVisited,
      dailyCollectionAmount: totals.dailyCollectionAmount,
      monthlyCollectionAmount: totals.monthlyCollectionAmount,
      totalExpenditures: totals.totalExpenditures,
      totalSevasPerformed: totals.totalSevasPerformed,
    },
    analytics: {
      monthlyRevenue: [
        { label: 'Bookings', value: totals.monthlyCollectionAmount },
        { label: 'Expenditure', value: totals.totalExpenditures },
        { label: 'Net', value: totals.monthlyCollectionAmount - totals.totalExpenditures },
      ],
      popularSevas: totals.popularSevas,
    },
    upcomingEvents: [
      { title: 'Pournami Pooja', date: `${currentMonth}-18`, type: 'Special Pooja' },
      { title: 'Temple Festival', date: `${currentMonth}-27`, type: 'Festival' },
    ],
    notifications,
  });
};

module.exports = { getDashboard };
