const { randomUUID } = require('crypto');

const { db, withTransaction } = require('../services/db');
const repo = require('../services/repository');
const { CATEGORIES, CATEGORY_LABELS } = require('../config/paymentCategories');
const { resolvePeriod } = require('../utils/period');
const { HttpError } = require('../utils/httpError');
const { sendResponse } = require('../utils/response');

const listReceipts = async (req, res) => {
  const period = resolvePeriod(req.query);
  const receipts = await repo.listReceiptsBetween(db, period.from, period.to, req.query.category || null);
  return sendResponse(res, 200, 'Receipts fetched successfully', receipts);
};

const createReceipt = async (req, res) => {
  const { category } = req.body;
  const now = new Date().toISOString();

  const receipt = {
    id: randomUUID(),
    category,
    receiptDate: req.body.receiptDate,
    devoteeName: req.body.devoteeName || '',
    mobileNumber: req.body.mobileNumber || '',
    amount: Number(req.body.amount),
    paymentMode: req.body.paymentMode,
    paymentReferenceNumber: req.body.paymentReferenceNumber || '',
    notes: req.body.notes || '',
    receiptNumber: null, // assigned from the financial-year series inside the transaction
    status: 'confirmed',
    createdBy: req.user.email,
    createdAt: now,
    updatedAt: now,
  };

  await withTransaction(async (client) => {
    receipt.receiptNumber = await repo.nextReceiptNumber(client);
    await repo.insertReceipt(client, receipt);
    await repo.insertNotification(client, {
      title: `${CATEGORY_LABELS[category]} received`,
      description: `${receipt.devoteeName || CATEGORY_LABELS[category]} - Rs. ${receipt.amount}`,
      type: 'receipt',
    });
    await repo.insertAuditLog(client, 'CREATE', 'receipt', receipt, req.user.email);
  });

  return sendResponse(res, 201, 'Receipt recorded successfully', receipt);
};

const updateReceipt = async (req, res) => {
  const receipt = await withTransaction(async (client) => {
    const existing = await repo.findReceipt(client, req.params.id, { forUpdate: true });

    if (!existing) {
      throw new HttpError(404, 'Receipt not found', [req.params.id]);
    }

    if (existing.status === 'cancelled') {
      throw new HttpError(409, 'A cancelled receipt cannot be edited', []);
    }

    // The category decides the accounting head and receipt number, so it is fixed once recorded.
    const updated = {
      ...existing,
      receiptDate: req.body.receiptDate ?? existing.receiptDate,
      devoteeName: req.body.devoteeName ?? existing.devoteeName,
      mobileNumber: req.body.mobileNumber ?? existing.mobileNumber,
      amount: req.body.amount !== undefined ? Number(req.body.amount) : existing.amount,
      paymentMode: req.body.paymentMode ?? existing.paymentMode,
      paymentReferenceNumber: req.body.paymentReferenceNumber ?? existing.paymentReferenceNumber,
      notes: req.body.notes ?? existing.notes,
      updatedAt: new Date().toISOString(),
    };

    if (updated.category !== CATEGORIES.HUNDI_COLLECTION && !updated.devoteeName.trim()) {
      throw new HttpError(400, 'Devotee name is required', ['devoteeName']);
    }

    await repo.saveReceipt(client, updated);
    await repo.insertAuditLog(client, 'UPDATE', 'receipt', { before: existing, after: updated }, req.user.email);
    return updated;
  });

  return sendResponse(res, 200, 'Receipt updated successfully', receipt);
};

// Receipts are never deleted: cancelling keeps the record for audit and removes it from the accounts.
const cancelReceipt = async (req, res) => {
  const receipt = await withTransaction(async (client) => {
    const existing = await repo.findReceipt(client, req.params.id, { forUpdate: true });

    if (!existing) {
      throw new HttpError(404, 'Receipt not found', [req.params.id]);
    }

    const cancelled = { ...existing, status: 'cancelled', updatedAt: new Date().toISOString() };
    await repo.saveReceipt(client, cancelled);
    await repo.insertAuditLog(client, 'CANCEL', 'receipt', cancelled, req.user.email);
    return cancelled;
  });

  return sendResponse(res, 200, 'Receipt cancelled successfully', receipt);
};

module.exports = { listReceipts, createReceipt, updateReceipt, cancelReceipt };
