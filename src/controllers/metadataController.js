const { randomUUID } = require('crypto');

const { appendAuditLog, readStore, writeStore } = require('../services/storeService');
const { sendResponse } = require('../utils/response');

const getMetadata = async (req, res, next) => {
  try {
    const { type } = req.params;
    const store = await readStore();
    const collection = store.metadata[type];

    if (!collection) {
      return sendResponse(res, 404, 'Metadata type not found', null, [type]);
    }

    return sendResponse(res, 200, 'Metadata fetched successfully', collection);
  } catch (error) {
    return next(error);
  }
};

const createMetadata = async (req, res, next) => {
  try {
    const { type } = req.params;
    const store = await readStore();
    const collection = store.metadata[type];

    if (!collection) {
      return sendResponse(res, 404, 'Metadata type not found', null, [type]);
    }

    const name = String(req.body.name || '').trim();
    if (!name) {
      return sendResponse(res, 400, 'Name is required', null, ['name']);
    }

    const duplicate = collection.some((entry) => entry.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      return sendResponse(res, 409, 'Duplicate metadata value', null, [name]);
    }

    const item = { id: randomUUID(), name, nameKn: String(req.body.nameKn || '').trim(), enabled: req.body.enabled !== false };
    collection.push(item);
    appendAuditLog(store, 'CREATE', type, item, req.user.email);
    await writeStore(store);

    return sendResponse(res, 201, 'Metadata created successfully', item);
  } catch (error) {
    return next(error);
  }
};

const updateMetadata = async (req, res, next) => {
  try {
    const { id, type } = req.params;
    const store = await readStore();
    const collection = store.metadata[type];
    const item = collection?.find((entry) => entry.id === id);

    if (!item) {
      return sendResponse(res, 404, 'Metadata entry not found', null, [id]);
    }

    item.name = req.body.name ?? item.name;
    item.nameKn = req.body.nameKn !== undefined ? String(req.body.nameKn).trim() : (item.nameKn || '');
    item.enabled = req.body.enabled ?? item.enabled;
    appendAuditLog(store, 'UPDATE', type, item, req.user.email);
    await writeStore(store);

    return sendResponse(res, 200, 'Metadata updated successfully', item);
  } catch (error) {
    return next(error);
  }
};

const deleteMetadata = async (req, res, next) => {
  try {
    const { id, type } = req.params;
    const store = await readStore();
    const collection = store.metadata[type];
    const index = collection?.findIndex((entry) => entry.id === id);

    if (index === undefined || index < 0) {
      return sendResponse(res, 404, 'Metadata entry not found', null, [id]);
    }

    const [removed] = collection.splice(index, 1);
    appendAuditLog(store, 'DELETE', type, removed, req.user.email);
    await writeStore(store);

    return sendResponse(res, 200, 'Metadata deleted successfully', removed);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMetadata, createMetadata, updateMetadata, deleteMetadata };
