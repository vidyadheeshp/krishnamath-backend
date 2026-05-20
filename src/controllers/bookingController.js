const { randomUUID } = require('crypto');

const { appendAuditLog, readStore, writeStore } = require('../services/storeService');
const { createReceiptNumber } = require('../utils/receipt');
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

const getBookingSevaIds = (booking) =>
  Array.isArray(booking.sevaIds) && booking.sevaIds.length > 0
    ? booking.sevaIds
    : booking.sevaId
      ? [booking.sevaId]
      : [];

const enrichBooking = (booking, store) => {
  const sevaIds = getBookingSevaIds(booking);
  const sevas = sevaIds
    .map((sevaId) => store.sevas.find((entry) => entry.id === sevaId))
    .filter(Boolean);

  return {
    ...booking,
    sevaId: booking.sevaId || sevaIds[0] || null,
    sevaIds,
    seva: sevas[0] || null,
    sevas,
  };
};

const listBookings = async (_req, res, next) => {
  try {
    const store = await readStore();
    return sendResponse(
      res,
      200,
      'Bookings fetched successfully',
      store.bookings.map((booking) => enrichBooking(booking, store)),
    );
  } catch (error) {
    return next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const store = await readStore();
    const selectedSevaIds = normalizeSevaIds(req.body.sevaId, req.body.sevaIds);

    if (selectedSevaIds.length === 0) {
      return sendResponse(res, 400, 'Select at least one seva', null, ['sevaId']);
    }

    const selectedSevas = selectedSevaIds
      .map((sevaId) => store.sevas.find((entry) => entry.id === sevaId))
      .filter(Boolean);

    if (selectedSevas.length !== selectedSevaIds.length) {
      const missingSevas = selectedSevaIds.filter((sevaId) => !selectedSevas.some((seva) => seva.id === sevaId));
      return sendResponse(res, 404, 'One or more selected sevas were not found', null, missingSevas);
    }

    const slotDate = req.body.bookingDate;
    const slotTime = req.body.bookingTime;

    for (const seva of selectedSevas) {
      const sameSlotBookings = store.bookings.filter((entry) => {
        if (entry.status === 'cancelled') {
          return false;
        }

        const entrySevaIds = getBookingSevaIds(entry);
        return entry.bookingDate === slotDate && entry.bookingTime === slotTime && entrySevaIds.includes(seva.id);
      });

      if (sameSlotBookings.length >= seva.maxBookingsPerDay) {
        return sendResponse(res, 409, `Seva capacity reached for ${seva.name} in this slot`, null, [slotDate]);
      }
    }

    const devotee = {
      id: randomUUID(),
      name: req.body.devoteeName,
      mobileNumber: req.body.mobileNumber,
      address: req.body.address || '',
      gotra: req.body.gotra || '',
      nakshatra: req.body.nakshatra || '',
      raashi: req.body.raashi || '',
    };

    const discount = Number(req.body.discount || 0);
    const defaultAmountPayable = selectedSevas.reduce((sum, seva) => sum + Number(seva.amount || 0), 0);
    const amountPayable = Number(req.body.amountPayable ?? defaultAmountPayable);
    const amountCollected = Math.max(amountPayable - discount, 0);
    const booking = {
      id: randomUUID(),
      devotee,
      devoteeId: devotee.id,
      sevaId: selectedSevaIds[0],
      sevaIds: selectedSevaIds,
      bookingDate: req.body.bookingDate,
      bookingTime: req.body.bookingTime,
      status: req.body.status || 'confirmed',
      paymentMode: req.body.paymentMode,
      paymentReferenceNumber: req.body.paymentReferenceNumber || '',
      amountPayable,
      discount,
      amountCollected,
      notes: req.body.notes || '',
      receiptNumber: createReceiptNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.devotees.unshift(devotee);
    store.bookings.unshift(booking);

    const sevaNames = selectedSevas.map((seva) => seva.name);
    store.notifications.unshift({
      id: randomUUID(),
      title: 'Booking confirmed',
      description: `${devotee.name} booked ${sevaNames.join(', ')}`,
      type: 'booking',
      createdAt: new Date().toISOString(),
    });
    appendAuditLog(store, 'CREATE', 'booking', booking, req.user.email);
    await writeStore(store);

    return sendResponse(res, 201, 'Booking created successfully', enrichBooking(booking, store));
  } catch (error) {
    return next(error);
  }
};

const updateBooking = async (req, res, next) => {
  try {
    const store = await readStore();
    const booking = store.bookings.find((entry) => entry.id === req.params.id);

    if (!booking) {
      return sendResponse(res, 404, 'Booking not found', null, [req.params.id]);
    }

    if (req.body.sevaId !== undefined || req.body.sevaIds !== undefined) {
      const selectedSevaIds = normalizeSevaIds(req.body.sevaId, req.body.sevaIds);

      if (selectedSevaIds.length === 0) {
        return sendResponse(res, 400, 'Select at least one seva', null, ['sevaId']);
      }

      const allSevasAvailable = selectedSevaIds.every((sevaId) => store.sevas.some((seva) => seva.id === sevaId));
      if (!allSevasAvailable) {
        return sendResponse(res, 404, 'One or more selected sevas were not found', null, selectedSevaIds);
      }

      booking.sevaId = selectedSevaIds[0];
      booking.sevaIds = selectedSevaIds;
    }

    Object.assign(booking, {
      bookingDate: req.body.bookingDate ?? booking.bookingDate,
      bookingTime: req.body.bookingTime ?? booking.bookingTime,
      status: req.body.status ?? booking.status,
      paymentMode: req.body.paymentMode ?? booking.paymentMode,
      paymentReferenceNumber: req.body.paymentReferenceNumber ?? booking.paymentReferenceNumber,
      discount: req.body.discount !== undefined ? Number(req.body.discount) : booking.discount,
      amountPayable: req.body.amountPayable !== undefined ? Number(req.body.amountPayable) : booking.amountPayable,
      notes: req.body.notes ?? booking.notes,
      updatedAt: new Date().toISOString(),
    });
    booking.amountCollected = Math.max(booking.amountPayable - booking.discount, 0);

    appendAuditLog(store, 'UPDATE', 'booking', booking, req.user.email);
    await writeStore(store);
    return sendResponse(res, 200, 'Booking updated successfully', enrichBooking(booking, store));
  } catch (error) {
    return next(error);
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const store = await readStore();
    const booking = store.bookings.find((entry) => entry.id === req.params.id);

    if (!booking) {
      return sendResponse(res, 404, 'Booking not found', null, [req.params.id]);
    }

    booking.status = 'cancelled';
    booking.updatedAt = new Date().toISOString();
    appendAuditLog(store, 'CANCEL', 'booking', booking, req.user.email);
    await writeStore(store);
    return sendResponse(res, 200, 'Booking cancelled successfully', enrichBooking(booking, store));
  } catch (error) {
    return next(error);
  }
};

module.exports = { listBookings, createBooking, updateBooking, deleteBooking };
