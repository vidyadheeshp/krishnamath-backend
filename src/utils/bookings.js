const { todayInIndia } = require('./dates');

const getBookingSevaIds = (booking) =>
  Array.isArray(booking.sevaIds) && booking.sevaIds.length > 0 ? booking.sevaIds : booking.sevaId ? [booking.sevaId] : [];

// A booking can be cancelled up to and including the day of the seva; after that it is frozen.
const isCancellable = (booking, today = todayInIndia()) => booking.status !== 'cancelled' && booking.bookingDate >= today;

const enrichBooking = (booking, sevas) => {
  const sevaIds = getBookingSevaIds(booking);
  const bookingSevas = sevaIds.map((sevaId) => sevas.find((entry) => entry.id === sevaId)).filter(Boolean);

  return {
    ...booking,
    sevaId: booking.sevaId || sevaIds[0] || null,
    sevaIds,
    seva: bookingSevas[0] || null,
    sevas: bookingSevas,
    cancellable: isCancellable(booking),
  };
};

module.exports = { getBookingSevaIds, enrichBooking, isCancellable };
