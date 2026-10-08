const { randomUUID } = require('crypto');

const { db, withTransaction } = require('../services/db');
const repo = require('../services/repository');
const { HttpError } = require('../utils/httpError');
const { sendResponse } = require('../utils/response');

const listSevas = async (_req, res) => {
  return sendResponse(res, 200, 'Sevas fetched successfully', await repo.listSevas(db));
};

const createSeva = async (req, res) => {
  const seva = {
    id: randomUUID(),
    name: req.body.name,
    nameKn: String(req.body.nameKn || '').trim(),
    description: req.body.description || '',
    amount: Number(req.body.amount || 0),
    category: req.body.category || 'General',
    availabilityStatus: req.body.availabilityStatus || 'active',
    instructions: req.body.instructions || '',
  };

  await withTransaction(async (client) => {
    await repo.insertSeva(client, seva);
    await repo.insertAuditLog(client, 'CREATE', 'seva', seva, req.user.email);
  });

  return sendResponse(res, 201, 'Seva created successfully', seva);
};

const updateSeva = async (req, res) => {
  const seva = await withTransaction(async (client) => {
    const existing = await repo.findSeva(client, req.params.id, { forUpdate: true });

    if (!existing) {
      throw new HttpError(404, 'Seva not found', [req.params.id]);
    }

    const updated = {
      ...existing,
      name: req.body.name ?? existing.name,
      nameKn: req.body.nameKn !== undefined ? String(req.body.nameKn).trim() : existing.nameKn,
      description: req.body.description ?? existing.description,
      amount: req.body.amount !== undefined ? Number(req.body.amount) : existing.amount,
      category: req.body.category ?? existing.category,
      availabilityStatus: req.body.availabilityStatus ?? existing.availabilityStatus,
      instructions: req.body.instructions ?? existing.instructions,
    };

    await repo.saveSeva(client, updated);
    await repo.insertAuditLog(client, 'UPDATE', 'seva', updated, req.user.email);
    return updated;
  });

  return sendResponse(res, 200, 'Seva updated successfully', seva);
};

const deleteSeva = async (req, res) => {
  const removed = await withTransaction(async (client) => {
    const existing = await repo.findSeva(client, req.params.id, { forUpdate: true });

    if (!existing) {
      throw new HttpError(404, 'Seva not found', [req.params.id]);
    }

    // A seva that already has bookings is rejected by the foreign key (surfaced as HTTP 409).
    await repo.deleteSeva(client, existing.id);
    await repo.insertAuditLog(client, 'DELETE', 'seva', existing, req.user.email);
    return existing;
  });

  return sendResponse(res, 200, 'Seva deleted successfully', removed);
};

module.exports = { listSevas, createSeva, updateSeva, deleteSeva };
