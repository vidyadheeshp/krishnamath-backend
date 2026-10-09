const { randomUUID } = require('crypto');

const { db, withTransaction } = require('../services/db');
const repo = require('../services/repository');
const { enrichBooking, getBookingSevaIds, isCancellable } = require('../utils/bookings');
const { todayInIndia } = require('../utils/dates');
const { HttpError } = require('../utils/httpError');
const { sendResponse } = require('../utils/response');

const normalizeSevaIds = (sevaId, sevaIds) => {
  const values = [];

  if (sevaId) {
    values.push(sevaId);
  }

  if (Array.isArray(sevaIds)) {
    values.push(...sevaIds);
  }

  return [...new Set(values.filter(Boolean))];
};

// Treats undefined, null and an empty string as "not provided".
const optionalNumber = (value) => (value === undefined || value === null || value === '' ? undefined : Number(value));

// No bookings are accepted on a blocked date (e.g. Ekadashi, when the sevas are performed at the temple).
const assertDateOpen = async (client, date) => {
  const blocked = await repo.findBlockedDate(client, date);

  if (blocked) {
    throw new HttpError(409, `Bookings are closed on ${date}${blocked.reason ? `: ${blocked.reason}` : ''}`, [date]);
  }
};

// Loads the selected sevas, failing with 404 if any of them no longer exists.
const loadSevas = async (client, sevaIds) => {
  const sevas = await repo.findSevasByIds(client, sevaIds);

  if (sevas.length !== sevaIds.length) {
    const missing = sevaIds.filter((sevaId) => !sevas.some((seva) => seva.id === sevaId));
    throw new HttpError(404, 'One or more selected sevas were not found', missing);
  }

  return sevas;
};

const listBookings = async (_req, res) => {
  const [bookings, sevas] = await Promise.all([repo.listBookings(db), repo.listSevas(db)]);
  return sendResponse(res, 200, 'Bookings fetched successfully', bookings.map((booking) => enrichBooking(booking, sevas)));
};

const createBooking = async (req, res) => {
  const selectedSevaIds = normalizeSevaIds(req.body.sevaId, req.body.sevaIds);

  if (selectedSevaIds.length === 0) {
    throw new HttpError(400, 'Select at least one seva', ['sevaId']);
  }

  const { booking, sevas } = await withTransaction(async (client) => {
    await assertDateOpen(client, req.body.bookingDate);
    const selectedSevas = await loadSevas(client, selectedSevaIds);

    // Taken inside the transaction, so a booking that fails to save never uses up a receipt number.
    const receiptNumber = await repo.nextReceiptNumber(client);

    const defaultAmountPayable = selectedSevas.reduce((sum, seva) => sum + seva.amount, 0);
    const amountPayable = optionalNumber(req.body.amountPayable) ?? defaultAmountPayable;
    const donation = optionalNumber(req.body.donation) ?? 0;

    const devotee = {
      id: randomUUID(),
      name: req.body.devoteeName,
      mobileNumber: req.body.mobileNumber,
      address: req.body.address || '',
      gotra: req.body.gotra || '',
      nakshatra: req.body.nakshatra || '',
      raashi: req.body.raashi || '',
    };

    // Booking time is auto-recorded from the server clock at creation time
    // rather than chosen by the user.
    const now = new Date();
    const newBooking = {
      id: randomUUID(),
      devotee,
      devoteeId: devotee.id,
      sevaId: selectedSevaIds[0],
      sevaIds: selectedSevaIds,
      bookingDate: req.body.bookingDate,
      bookingTime: now.toTimeString().slice(0, 5),
      status: req.body.status || 'confirmed',
      paymentMode: req.body.paymentMode,
      paymentReferenceNumber: req.body.paymentReferenceNumber || '',
      amountPayable,
      donation,
      // The donation is paid on top of the seva amount.
      amountCollected: amountPayable + donation,
      notes: req.body.notes || '',
      receiptNumber,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await repo.insertDevotee(client, devotee);
    await repo.insertBooking(client, newBooking);
    await repo.insertNotification(client, {
      title: 'Booking confirmed',
      description: `${devotee.name} booked ${selectedSevas.map((seva) => seva.name).join(', ')}`,
      type: 'booking',
    });
    await repo.insertAuditLog(client, 'CREATE', 'booking', newBooking, req.user.email);

    return { booking: newBooking, sevas: selectedSevas };
  });

  return sendResponse(res, 201, 'Booking created successfully', enrichBooking(booking, sevas));
};

const updateBooking = async (req, res) => {
  const { booking, sevas } = await withTransaction(async (client) => {
    const existing = await repo.findBooking(client, req.params.id, { forUpdate: true });

    if (!existing) {
      throw new HttpError(404, 'Booking not found', [req.params.id]);
    }

    if (existing.status === 'cancelled') {
      throw new HttpError(409, 'A cancelled booking cannot be edited', []);
    }

    // Once the seva date has passed the booking is frozen: its date cannot be moved (which would otherwise
    // reopen cancellation).
    if (req.body.bookingDate && req.body.bookingDate !== existing.bookingDate && existing.bookingDate < todayInIndia()) {
      throw new HttpError(409, 'The seva date has passed, so the booking date can no longer be changed', [existing.bookingDate]);
    }

    if (req.body.bookingDate && req.body.bookingDate !== existing.bookingDate) {
      await assertDateOpen(client, req.body.bookingDate);
    }

    const sevasProvided = req.body.sevaId !== undefined || req.body.sevaIds !== undefined;
    const nextSevaIds = sevasProvided ? normalizeSevaIds(req.body.sevaId, req.body.sevaIds) : getBookingSevaIds(existing);

    if (nextSevaIds.length === 0) {
      throw new HttpError(400, 'Select at least one seva', ['sevaId']);
    }

    const updated = {
      ...existing,
      sevaId: nextSevaIds[0],
      sevaIds: nextSevaIds,
      bookingDate: req.body.bookingDate ?? existing.bookingDate,
      bookingTime: req.body.bookingTime ?? existing.bookingTime,
      status: req.body.status ?? existing.status,
      paymentMode: req.body.paymentMode ?? existing.paymentMode,
      paymentReferenceNumber: req.body.paymentReferenceNumber ?? existing.paymentReferenceNumber,
      amountPayable: optionalNumber(req.body.amountPayable) ?? existing.amountPayable,
      donation: optionalNumber(req.body.donation) ?? existing.donation,
      notes: req.body.notes ?? existing.notes,
      updatedAt: new Date().toISOString(),
    };

    updated.amountCollected = updated.amountPayable + updated.donation;

    const selectedSevas = await loadSevas(client, updated.sevaIds);

    await repo.saveBooking(client, updated);
    await repo.insertAuditLog(client, 'UPDATE', 'booking', updated, req.user.email);

    return { booking: updated, sevas: selectedSevas };
  });

  return sendResponse(res, 200, 'Booking updated successfully', enrichBooking(booking, sevas));
};

// Cancelling keeps the booking (for audit and the receipt) but removes it from every total. It needs a
// reason, records who cancelled and when, and cannot be undone or repeated.
const cancelBooking = async (req, res) => {
  const { booking, sevas } = await withTransaction(async (client) => {
    const existing = await repo.findBooking(client, req.params.id, { forUpdate: true });

    if (!existing) {
      throw new HttpError(404, 'Booking not found', [req.params.id]);
    }

    if (existing.status === 'cancelled') {
      throw new HttpError(409, 'This booking is already cancelled', []);
    }

    // Frozen once the seva date has passed (the day of the seva itself is still allowed).
    if (!isCancellable(existing)) {
      throw new HttpError(409, `Cancellation is closed: the seva date (${existing.bookingDate}) has passed`, [existing.bookingDate]);
    }

    const now = new Date().toISOString();
    const cancelled = {
      ...existing,
      status: 'cancelled',
      cancellationReason: req.body.reason,
      cancelledAt: now,
      cancelledBy: req.user.email,
      updatedAt: now,
    };

    await repo.saveBooking(client, cancelled);
    await repo.insertNotification(client, {
      title: 'Booking cancelled',
      description: `${existing.devotee?.name ?? 'A booking'} (${existing.receiptNumber}) - ${req.body.reason}`,
      type: 'booking',
    });
    await repo.insertAuditLog(
      client,
      'CANCEL',
      'booking',
      { id: existing.id, receiptNumber: existing.receiptNumber, amountCollected: existing.amountCollected, reason: req.body.reason },
      req.user.email,
    );

    return { booking: cancelled, sevas: await repo.listSevas(client) };
  });

  return sendResponse(res, 200, 'Booking cancelled successfully', enrichBooking(booking, sevas));
};

module.exports = { listBookings, createBooking, updateBooking, cancelBooking };
