const { randomUUID } = require('crypto');

const { appendAuditLog, readStore, writeStore } = require('../services/storeService');
const { sendResponse } = require('../utils/response');

const listSevas = async (_req, res, next) => {
  try {
    const store = await readStore();
    return sendResponse(res, 200, 'Sevas fetched successfully', store.sevas);
  } catch (error) {
    return next(error);
  }
};

const createSeva = async (req, res, next) => {
  try {
    const store = await readStore();
    const seva = {
      id: randomUUID(),
      name: req.body.name,
      nameKn: String(req.body.nameKn || '').trim(),
      description: req.body.description || '',
      amount: Number(req.body.amount || 0),
      duration: Number(req.body.duration || 30),
      category: req.body.category || 'General',
      maxBookingsPerDay: Number(req.body.maxBookingsPerDay || 10),
      availabilityStatus: req.body.availabilityStatus || 'active',
      instructions: req.body.instructions || '',
    };

    store.sevas.unshift(seva);
    appendAuditLog(store, 'CREATE', 'seva', seva, req.user.email);
    await writeStore(store);

    return sendResponse(res, 201, 'Seva created successfully', seva);
  } catch (error) {
    return next(error);
  }
};

const updateSeva = async (req, res, next) => {
  try {
    const store = await readStore();
    const seva = store.sevas.find((entry) => entry.id === req.params.id);

    if (!seva) {
      return sendResponse(res, 404, 'Seva not found', null, [req.params.id]);
    }

    Object.assign(seva, {
      name: req.body.name ?? seva.name,
      nameKn: req.body.nameKn !== undefined ? String(req.body.nameKn).trim() : (seva.nameKn || ''),
      description: req.body.description ?? seva.description,
      amount: req.body.amount !== undefined ? Number(req.body.amount) : seva.amount,
      duration: req.body.duration !== undefined ? Number(req.body.duration) : seva.duration,
      category: req.body.category ?? seva.category,
      maxBookingsPerDay:
        req.body.maxBookingsPerDay !== undefined
          ? Number(req.body.maxBookingsPerDay)
          : seva.maxBookingsPerDay,
      availabilityStatus: req.body.availabilityStatus ?? seva.availabilityStatus,
      instructions: req.body.instructions ?? seva.instructions,
    });

    appendAuditLog(store, 'UPDATE', 'seva', seva, req.user.email);
    await writeStore(store);
    return sendResponse(res, 200, 'Seva updated successfully', seva);
  } catch (error) {
    return next(error);
  }
};

const deleteSeva = async (req, res, next) => {
  try {
    const store = await readStore();
    const index = store.sevas.findIndex((entry) => entry.id === req.params.id);

    if (index < 0) {
      return sendResponse(res, 404, 'Seva not found', null, [req.params.id]);
    }

    const [removed] = store.sevas.splice(index, 1);
    appendAuditLog(store, 'DELETE', 'seva', removed, req.user.email);
    await writeStore(store);
    return sendResponse(res, 200, 'Seva deleted successfully', removed);
  } catch (error) {
    return next(error);
  }
};

module.exports = { listSevas, createSeva, updateSeva, deleteSeva };
