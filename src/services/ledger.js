// One flat ledger of every rupee received, built from seva bookings and the other receipts.
// Finance overview, payments view and the Tally export all read from this, so they always agree.
const { CATEGORIES, CATEGORY_LABELS } = require('../config/paymentCategories');
const { enrichBooking } = require('../utils/bookings');

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// Bookings -> "Religious Seva" (seva amount) plus "Donation" (extra donation given with the booking).
// Receipts -> their own category. Cancelled items are excluded from the entries but counted.
const buildLedger = ({ bookings, sevas, receipts }) => {
  const entries = [];
  let cancelled = 0;

  bookings.forEach((booking) => {
    if (booking.status === 'cancelled') {
      cancelled += 1;
      return;
    }

    const base = {
      source: 'booking',
      sourceId: booking.id,
      receiptNumber: booking.receiptNumber,
      date: booking.bookingDate,
      devotee: booking.devotee?.name ?? '',
      mobileNumber: booking.devotee?.mobileNumber ?? '',
      paymentMode: booking.paymentMode,
      reference: booking.paymentReferenceNumber || '',
      createdAt: booking.createdAt,
    };

    if (booking.amountPayable > 0) {
      entries.push({
        ...base,
        key: `booking:${booking.id}:seva`,
        category: CATEGORIES.RELIGIOUS_SEVA,
        particulars: enrichBooking(booking, sevas).sevas.map((seva) => seva.name).join(', '),
        amount: round2(booking.amountPayable),
      });
    }

    if (booking.donation > 0) {
      entries.push({
        ...base,
        key: `booking:${booking.id}:donation`,
        category: CATEGORIES.DONATION,
        particulars: 'Donation with seva booking',
        amount: round2(booking.donation),
      });
    }
  });

  receipts.forEach((receipt) => {
    if (receipt.status === 'cancelled') {
      cancelled += 1;
      return;
    }

    entries.push({
      key: `receipt:${receipt.id}`,
      source: 'receipt',
      sourceId: receipt.id,
      receiptNumber: receipt.receiptNumber,
      date: receipt.receiptDate,
      devotee: receipt.devoteeName,
      mobileNumber: receipt.mobileNumber,
      category: receipt.category,
      particulars: receipt.notes || CATEGORY_LABELS[receipt.category],
      paymentMode: receipt.paymentMode,
      reference: receipt.paymentReferenceNumber || '',
      amount: round2(receipt.amount),
      createdAt: receipt.createdAt,
    });
  });

  entries.sort((left, right) => left.date.localeCompare(right.date) || left.createdAt.localeCompare(right.createdAt));

  return { entries, cancelled };
};

const sumAmount = (entries) => round2(entries.reduce((total, entry) => total + entry.amount, 0));

module.exports = { buildLedger, sumAmount, round2 };
