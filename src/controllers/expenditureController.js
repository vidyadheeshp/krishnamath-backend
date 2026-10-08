const { randomUUID } = require('crypto');

const { db, withTransaction } = require('../services/db');
const repo = require('../services/repository');
const { HttpError } = require('../utils/httpError');
const { sendResponse } = require('../utils/response');

const listExpenditures = async (_req, res) => {
  return sendResponse(res, 200, 'Expenditures fetched successfully', await repo.listExpenditures(db));
};

const createExpenditure = async (req, res) => {
  const expenditure = {
    id: randomUUID(),
    expenseTitle: req.body.expenseTitle,
    expenseCategory: req.body.expenseCategory,
    expenseAmount: Number(req.body.expenseAmount),
    expenseDate: req.body.expenseDate,
    paymentMode: req.body.paymentMode,
    vendorDetails: req.body.vendorDetails || '',
    notes: req.body.notes || '',
  };

  await withTransaction(async (client) => {
    await repo.insertExpenditure(client, expenditure);
    await repo.insertAuditLog(client, 'CREATE', 'expenditure', expenditure, req.user.email);
  });

  return sendResponse(res, 201, 'Expenditure created successfully', expenditure);
};

const updateExpenditure = async (req, res) => {
  const expenditure = await withTransaction(async (client) => {
    const existing = await repo.findExpenditure(client, req.params.id, { forUpdate: true });

    if (!existing) {
      throw new HttpError(404, 'Expenditure not found', [req.params.id]);
    }

    const updated = {
      ...existing,
      expenseTitle: req.body.expenseTitle ?? existing.expenseTitle,
      expenseCategory: req.body.expenseCategory ?? existing.expenseCategory,
      expenseAmount: req.body.expenseAmount !== undefined ? Number(req.body.expenseAmount) : existing.expenseAmount,
      expenseDate: req.body.expenseDate ?? existing.expenseDate,
      paymentMode: req.body.paymentMode ?? existing.paymentMode,
      vendorDetails: req.body.vendorDetails ?? existing.vendorDetails,
      notes: req.body.notes ?? existing.notes,
    };

    await repo.saveExpenditure(client, updated);
    await repo.insertAuditLog(client, 'UPDATE', 'expenditure', updated, req.user.email);
    return updated;
  });

  return sendResponse(res, 200, 'Expenditure updated successfully', expenditure);
};

const deleteExpenditure = async (req, res) => {
  const removed = await withTransaction(async (client) => {
    const existing = await repo.findExpenditure(client, req.params.id, { forUpdate: true });

    if (!existing) {
      throw new HttpError(404, 'Expenditure not found', [req.params.id]);
    }

    await repo.deleteExpenditure(client, existing.id);
    await repo.insertAuditLog(client, 'DELETE', 'expenditure', existing, req.user.email);
    return existing;
  });

  return sendResponse(res, 200, 'Expenditure deleted successfully', removed);
};

module.exports = { listExpenditures, createExpenditure, updateExpenditure, deleteExpenditure };
