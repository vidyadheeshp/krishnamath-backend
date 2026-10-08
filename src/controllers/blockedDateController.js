const { randomUUID } = require('crypto');

const { db, withTransaction } = require('../services/db');
const repo = require('../services/repository');
const { HttpError } = require('../utils/httpError');
const { resolvePeriod } = require('../utils/period');
const { sendResponse } = require('../utils/response');

// Every blocked date, or just those of ?year=YYYY.
const listBlockedDates = async (req, res) => {
  const period = req.query.year ? resolvePeriod({ year: req.query.year }) : null;
  const items = await repo.listBlockedDates(db, period?.from ?? null, period?.to ?? null);
  return sendResponse(res, 200, 'Blocked dates fetched successfully', items);
};

// Blocks one or many dates in a single request (the whole year's Ekadashi list can be sent at once).
// Dates that are already blocked are skipped, never duplicated. Existing bookings on a newly blocked date are
// left alone; the response says how many there are so staff can contact those devotees.
const addBlockedDates = async (req, res) => {
  const reason = (req.body.reason || '').trim();
  const dates = [...new Set(req.body.dates)];

  const { insertedIds, items } = await withTransaction(async (client) => {
    const entries = dates.map((date) => ({ id: randomUUID(), date, reason, createdBy: req.user.email }));
    const inserted = await repo.insertBlockedDates(client, entries);

    if (inserted.length > 0) {
      await repo.insertAuditLog(
        client,
        'CREATE',
        'blocked-date',
        { dates: entries.filter((entry) => inserted.includes(entry.id)).map((entry) => entry.date), reason },
        req.user.email,
      );
    }

    const created = [];
    for (const id of inserted) created.push(await repo.findBlockedDateById(client, id));
    return { insertedIds: inserted, items: created };
  });

  return sendResponse(res, 201, 'Blocked dates saved successfully', {
    added: insertedIds.length,
    skipped: dates.length - insertedIds.length,
    items,
  });
};

const updateBlockedDate = async (req, res) => {
  const item = await withTransaction(async (client) => {
    const existing = await repo.findBlockedDateById(client, req.params.id);

    if (!existing) {
      throw new HttpError(404, 'Blocked date not found', [req.params.id]);
    }

    const reason = (req.body.reason || '').trim();
    await repo.updateBlockedDateReason(client, existing.id, reason);
    await repo.insertAuditLog(client, 'UPDATE', 'blocked-date', { date: existing.date, from: existing.reason, to: reason }, req.user.email);
    return repo.findBlockedDateById(client, existing.id);
  });

  return sendResponse(res, 200, 'Blocked date updated successfully', item);
};

// Unblocking simply reopens the date for bookings.
const removeBlockedDate = async (req, res) => {
  const removed = await withTransaction(async (client) => {
    const existing = await repo.findBlockedDateById(client, req.params.id);

    if (!existing) {
      throw new HttpError(404, 'Blocked date not found', [req.params.id]);
    }

    await repo.deleteBlockedDate(client, existing.id);
    await repo.insertAuditLog(client, 'DELETE', 'blocked-date', { date: existing.date, reason: existing.reason }, req.user.email);
    return existing;
  });

  return sendResponse(res, 200, 'Blocked date removed successfully', removed);
};

module.exports = { listBlockedDates, addBlockedDates, updateBlockedDate, removeBlockedDate };
