const { randomUUID } = require('crypto');

const { db, withTransaction } = require('../services/db');
const repo = require('../services/repository');
const { HttpError } = require('../utils/httpError');
const { sendResponse } = require('../utils/response');

const requireType = (type) => {
  if (!repo.isMetadataType(type)) {
    throw new HttpError(404, 'Metadata type not found', [type]);
  }
};

const getMetadata = async (req, res) => {
  const { type } = req.params;
  requireType(type);
  return sendResponse(res, 200, 'Metadata fetched successfully', await repo.listMetadata(db, type));
};

const createMetadata = async (req, res) => {
  const { type } = req.params;
  requireType(type);

  const name = String(req.body.name || '').trim();
  if (!name) {
    throw new HttpError(400, 'Name is required', ['name']);
  }

  const item = await withTransaction(async (client) => {
    if (await repo.metadataNameExists(client, type, name)) {
      throw new HttpError(409, 'Duplicate metadata value', [name]);
    }

    const created = {
      id: randomUUID(),
      name,
      nameKn: String(req.body.nameKn || '').trim(),
      enabled: req.body.enabled !== false,
    };
    await repo.insertMetadata(client, type, created);
    await repo.insertAuditLog(client, 'CREATE', type, created, req.user.email);
    return created;
  });

  return sendResponse(res, 201, 'Metadata created successfully', item);
};

const updateMetadata = async (req, res) => {
  const { id, type } = req.params;
  requireType(type);

  const item = await withTransaction(async (client) => {
    const existing = await repo.findMetadata(client, type, id, { forUpdate: true });

    if (!existing) {
      throw new HttpError(404, 'Metadata entry not found', [id]);
    }

    const updated = {
      ...existing,
      name: req.body.name ?? existing.name,
      nameKn: req.body.nameKn !== undefined ? String(req.body.nameKn).trim() : existing.nameKn,
      enabled: req.body.enabled ?? existing.enabled,
    };

    const renamed = updated.name.toLowerCase() !== existing.name.toLowerCase();
    if (renamed && (await repo.metadataNameExists(client, type, updated.name, id))) {
      throw new HttpError(409, 'Duplicate metadata value', [updated.name]);
    }

    await repo.saveMetadata(client, type, updated);
    await repo.insertAuditLog(client, 'UPDATE', type, updated, req.user.email);
    return updated;
  });

  return sendResponse(res, 200, 'Metadata updated successfully', item);
};

const deleteMetadata = async (req, res) => {
  const { id, type } = req.params;
  requireType(type);

  const removed = await withTransaction(async (client) => {
    const existing = await repo.findMetadata(client, type, id, { forUpdate: true });

    if (!existing) {
      throw new HttpError(404, 'Metadata entry not found', [id]);
    }

    await repo.deleteMetadata(client, type, id);
    await repo.insertAuditLog(client, 'DELETE', type, existing, req.user.email);
    return existing;
  });

  return sendResponse(res, 200, 'Metadata deleted successfully', removed);
};

module.exports = { getMetadata, createMetadata, updateMetadata, deleteMetadata };
