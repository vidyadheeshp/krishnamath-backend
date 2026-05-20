const { readStore } = require('../services/storeService');
const { sendResponse } = require('../utils/response');

const getBookingSevaIds = (booking) =>
  Array.isArray(booking.sevaIds) && booking.sevaIds.length > 0
    ? booking.sevaIds
    : booking.sevaId
      ? [booking.sevaId]
      : [];

const getReports = async (_req, res, next) => {
  try {
    const store = await readStore();
    const collectionsByMode = Object.values(
      store.bookings.reduce((accumulator, booking) => {
        if (booking.status === 'cancelled') {
          return accumulator;
        }

        if (!accumulator[booking.paymentMode]) {
          accumulator[booking.paymentMode] = { paymentMode: booking.paymentMode, amount: 0 };
        }

        accumulator[booking.paymentMode].amount += booking.amountCollected;
        return accumulator;
      }, {}),
    );

    const sevaRevenueMap = new Map(store.sevas.map((seva) => [seva.id, 0]));

    store.bookings.forEach((booking) => {
      if (booking.status === 'cancelled') {
        return;
      }

      const bookingSevaIds = getBookingSevaIds(booking);
      const bookingSevas = bookingSevaIds
        .map((sevaId) => store.sevas.find((seva) => seva.id === sevaId))
        .filter(Boolean);

      if (bookingSevas.length === 0) {
        return;
      }

      const configuredTotal = bookingSevas.reduce((sum, seva) => sum + Number(seva.amount || 0), 0);

      bookingSevas.forEach((seva) => {
        const share = configuredTotal > 0 ? (booking.amountCollected * Number(seva.amount || 0)) / configuredTotal : booking.amountCollected / bookingSevas.length;
        sevaRevenueMap.set(seva.id, (sevaRevenueMap.get(seva.id) || 0) + share);
      });
    });

    const sevaRevenue = store.sevas.map((seva) => ({
      sevaName: seva.name,
      revenue: sevaRevenueMap.get(seva.id) || 0,
    }));

    const enrichedBookings = store.bookings.map((booking) => ({
      ...booking,
      seva: store.sevas.find((s) => s.id === booking.sevaId) ?? null,
      sevas: getBookingSevaIds(booking)
        .map((sevaId) => store.sevas.find((s) => s.id === sevaId))
        .filter(Boolean),
    }));

    return sendResponse(res, 200, 'Reports fetched successfully', {
      financial: {
        dailyCollection: store.bookings
          .filter((booking) => booking.status !== 'cancelled')
          .reduce((sum, booking) => sum + booking.amountCollected, 0),
        yearlyCollection: store.bookings
          .filter((booking) => booking.status !== 'cancelled')
          .reduce((sum, booking) => sum + booking.amountCollected, 0),
        paymentModeWise: collectionsByMode,
        sevaWiseRevenue: sevaRevenue,
      },
      bookings: enrichedBookings,
      expenditures: store.expenditures,
      auditLogs: store.auditLogs.slice(0, 20),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getReports };
