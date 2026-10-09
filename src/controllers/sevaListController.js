const { db } = require('../services/db');
const { getPanchang } = require('../services/panchang');
const repo = require('../services/repository');
const { enrichBooking } = require('../utils/bookings');
const { addDays, todayInIndia } = require('../utils/dates');
const { sendResponse } = require('../utils/response');

// The list of sevas to be performed on a day (today or tomorrow, in Indian time), for the priest:
// one entry per booking with the devotee's name, gotra, nakshatra, raashi and the sevas booked.
// Cancelled bookings are left out.
const getSevaList = async (req, res) => {
  const today = todayInIndia();
  const dates = { today, tomorrow: addDays(today, 1) };
  const day = req.query.day === 'tomorrow' ? 'tomorrow' : 'today';
  const date = dates[day];

  const [bookings, sevas, blocked, panchang] = await Promise.all([
    repo.listBookingsBetween(db, date, addDays(date, 1)),
    repo.listSevas(db),
    repo.findBlockedDate(db, date),
    getPanchang(date, addDays(date, 1)).then((days) => days[date]).catch(() => null), // the list works without it
  ]);

  const entries = bookings
    .filter((booking) => booking.status !== 'cancelled')
    .map((booking) => {
      const enriched = enrichBooking(booking, sevas);

      return {
        id: booking.id,
        receiptNumber: booking.receiptNumber,
        bookingTime: booking.bookingTime,
        name: booking.devotee?.name ?? '',
        gotra: booking.devotee?.gotra ?? '',
        nakshatra: booking.devotee?.nakshatra ?? '',
        raashi: booking.devotee?.raashi ?? '',
        sevas: enriched.sevas.map((seva) => ({ id: seva.id, name: seva.name, nameKn: seva.nameKn })),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base', numeric: true }) || left.receiptNumber.localeCompare(right.receiptNumber));

  // How many times each seva is to be performed, so the priest can prepare.
  const counts = new Map();
  entries.forEach((entry) =>
    entry.sevas.forEach((seva) => {
      const current = counts.get(seva.id) ?? { name: seva.name, nameKn: seva.nameKn, count: 0 };
      current.count += 1;
      counts.set(seva.id, current);
    }),
  );

  return sendResponse(res, 200, 'Seva list fetched successfully', {
    day,
    date,
    dates,
    panchang,
    blockedReason: blocked ? blocked.reason || 'Blocked' : null,
    totals: { bookings: entries.length, sevas: entries.reduce((sum, entry) => sum + entry.sevas.length, 0) },
    sevaCounts: [...counts.values()].sort((left, right) => right.count - left.count || left.name.localeCompare(right.name)),
    entries,
  });
};

module.exports = { getSevaList };
