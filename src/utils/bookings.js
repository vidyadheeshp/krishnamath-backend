const { todayInIndia } = require('./dates');

const getBookingSevaIds = (booking) =>
  Array.isArray(booking.sevaIds) && booking.sevaIds.length > 0 ? booking.sevaIds : booking.sevaId ? [booking.sevaId] : [];

const isCash = (paymentMode) => String(paymentMode ?? '').trim().toLowerCase() === 'cash';

// Why a booking cannot be cancelled: 'payment-mode' (only cash bookings can be cancelled; money taken by UPI,
// cheque etc. has to be handled outside the portal), 'date' (a booking can be cancelled up to and including the
// day of the seva; after that it is frozen), or null when it can be cancelled.
const cancellationBlock = (booking, today = todayInIndia()) => {
  if (booking.status === 'cancelled') return 'cancelled';
  if (!isCash(booking.paymentMode)) return 'payment-mode';
  if (booking.bookingDate < today) return 'date';
  return null;
};

const isCancellable = (booking, today = todayInIndia()) => cancellationBlock(booking, today) === null;

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
    cancellationBlock: cancellationBlock(booking),
  };
};

module.exports = { getBookingSevaIds, enrichBooking, isCancellable, cancellationBlock };
