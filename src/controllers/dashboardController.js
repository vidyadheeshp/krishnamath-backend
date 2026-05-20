const { readStore } = require('../services/storeService');
const { sendResponse } = require('../utils/response');

const getBookingSevaIds = (booking) =>
  Array.isArray(booking.sevaIds) && booking.sevaIds.length > 0
    ? booking.sevaIds
    : booking.sevaId
      ? [booking.sevaId]
      : [];

const getDashboard = async (_req, res, next) => {
  try {
    const store = await readStore();
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = today.slice(0, 7);

    const todaysBookings = store.bookings.filter((entry) => entry.bookingDate === today && entry.status !== 'cancelled');
    const monthlyBookings = store.bookings.filter(
      (entry) => entry.bookingDate.startsWith(currentMonth) && entry.status !== 'cancelled',
    );
    const monthlyCollection = monthlyBookings.reduce((sum, entry) => sum + entry.amountCollected, 0);
    const totalExpenditures = store.expenditures.reduce((sum, entry) => sum + entry.expenseAmount, 0);

    const popularSevas = store.sevas
      .map((seva) => ({
        name: seva.name,
        nameKn: seva.nameKn || '',
        bookings: store.bookings.filter((entry) => {
          if (entry.status === 'cancelled') {
            return false;
          }

          return getBookingSevaIds(entry).includes(seva.id);
        }).length,
      }))
      .sort((left, right) => right.bookings - left.bookings);

    return sendResponse(res, 200, 'Dashboard fetched successfully', {
      stats: {
        currentDayBookings: todaysBookings.length,
        totalDevoteesVisited: store.devotees.length,
        dailyCollectionAmount: todaysBookings.reduce((sum, entry) => sum + entry.amountCollected, 0),
        monthlyCollectionAmount: monthlyCollection,
        totalExpenditures,
        totalSevasPerformed: store.bookings
          .filter((entry) => entry.status !== 'cancelled')
          .reduce((sum, entry) => sum + getBookingSevaIds(entry).length, 0),
      },
      analytics: {
        monthlyRevenue: [
          { label: 'Bookings', value: monthlyCollection },
          { label: 'Expenditure', value: totalExpenditures },
          { label: 'Net', value: monthlyCollection - totalExpenditures },
        ],
        popularSevas: popularSevas.slice(0, 5),
      },
      upcomingEvents: [
        { title: 'Pournami Pooja', date: `${currentMonth}-18`, type: 'Special Pooja' },
        { title: 'Temple Festival', date: `${currentMonth}-27`, type: 'Festival' },
      ],
      notifications: store.notifications.slice(0, 5),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getDashboard };
