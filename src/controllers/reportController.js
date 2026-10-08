const { db } = require('../services/db');
const repo = require('../services/repository');
const { enrichBooking, getBookingSevaIds } = require('../utils/bookings');
const { sendResponse } = require('../utils/response');

const getReports = async (_req, res) => {
  const [bookings, sevas, expenditures, auditLogs] = await Promise.all([
    repo.listBookings(db),
    repo.listSevas(db),
    repo.listExpenditures(db),
    repo.listAuditLogs(db, 20),
  ]);

  const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled');
  const totalCollection = activeBookings.reduce((sum, booking) => sum + booking.amountCollected, 0);

  const collectionsByMode = Object.values(
    activeBookings.reduce((accumulator, booking) => {
      if (!accumulator[booking.paymentMode]) {
        accumulator[booking.paymentMode] = { paymentMode: booking.paymentMode, amount: 0 };
      }

      accumulator[booking.paymentMode].amount += booking.amountCollected;
      return accumulator;
    }, {}),
  );

  // A multi-seva booking's collected amount is split across its sevas in proportion to their list price.
  const sevaRevenueMap = new Map(sevas.map((seva) => [seva.id, 0]));

  activeBookings.forEach((booking) => {
    const bookingSevas = getBookingSevaIds(booking)
      .map((sevaId) => sevas.find((seva) => seva.id === sevaId))
      .filter(Boolean);

    if (bookingSevas.length === 0) {
      return;
    }

    const configuredTotal = bookingSevas.reduce((sum, seva) => sum + seva.amount, 0);

    bookingSevas.forEach((seva) => {
      const share =
        configuredTotal > 0
          ? (booking.amountCollected * seva.amount) / configuredTotal
          : booking.amountCollected / bookingSevas.length;
      sevaRevenueMap.set(seva.id, (sevaRevenueMap.get(seva.id) || 0) + share);
    });
  });

  return sendResponse(res, 200, 'Reports fetched successfully', {
    financial: {
      dailyCollection: totalCollection,
      yearlyCollection: totalCollection,
      paymentModeWise: collectionsByMode,
      sevaWiseRevenue: sevas.map((seva) => ({ sevaName: seva.name, revenue: sevaRevenueMap.get(seva.id) || 0 })),
    },
    bookings: bookings.map((booking) => enrichBooking(booking, sevas)),
    expenditures,
    auditLogs,
  });
};

module.exports = { getReports };
