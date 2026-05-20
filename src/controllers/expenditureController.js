const { randomUUID } = require('crypto');

const { appendAuditLog, readStore, writeStore } = require('../services/storeService');
const { sendResponse } = require('../utils/response');

const listExpenditures = async (_req, res, next) => {
  try {
    const store = await readStore();
    return sendResponse(res, 200, 'Expenditures fetched successfully', store.expenditures);
  } catch (error) {
    return next(error);
  }
};

const createExpenditure = async (req, res, next) => {
  try {
    const store = await readStore();
    const expenditure = {
      id: randomUUID(),
      expenseTitle: req.body.expenseTitle,
      expenseCategory: req.body.expenseCategory,
      expenseAmount: Number(req.body.expenseAmount || 0),
      expenseDate: req.body.expenseDate,
      paymentMode: req.body.paymentMode,
      vendorDetails: req.body.vendorDetails || '',
      notes: req.body.notes || '',
    };

    store.expenditures.unshift(expenditure);
    appendAuditLog(store, 'CREATE', 'expenditure', expenditure, req.user.email);
    await writeStore(store);
    return sendResponse(res, 201, 'Expenditure created successfully', expenditure);
  } catch (error) {
    return next(error);
  }
};

const updateExpenditure = async (req, res, next) => {
  try {
    const store = await readStore();
    const expenditure = store.expenditures.find((entry) => entry.id === req.params.id);

    if (!expenditure) {
      return sendResponse(res, 404, 'Expenditure not found', null, [req.params.id]);
    }

    Object.assign(expenditure, {
      expenseTitle: req.body.expenseTitle ?? expenditure.expenseTitle,
      expenseCategory: req.body.expenseCategory ?? expenditure.expenseCategory,
      expenseAmount:
        req.body.expenseAmount !== undefined ? Number(req.body.expenseAmount) : expenditure.expenseAmount,
      expenseDate: req.body.expenseDate ?? expenditure.expenseDate,
      paymentMode: req.body.paymentMode ?? expenditure.paymentMode,
      vendorDetails: req.body.vendorDetails ?? expenditure.vendorDetails,
      notes: req.body.notes ?? expenditure.notes,
    });

    appendAuditLog(store, 'UPDATE', 'expenditure', expenditure, req.user.email);
    await writeStore(store);
    return sendResponse(res, 200, 'Expenditure updated successfully', expenditure);
  } catch (error) {
    return next(error);
  }
};

const deleteExpenditure = async (req, res, next) => {
  try {
    const store = await readStore();
    const index = store.expenditures.findIndex((entry) => entry.id === req.params.id);

    if (index < 0) {
      return sendResponse(res, 404, 'Expenditure not found', null, [req.params.id]);
    }

    const [removed] = store.expenditures.splice(index, 1);
    appendAuditLog(store, 'DELETE', 'expenditure', removed, req.user.email);
    await writeStore(store);
    return sendResponse(res, 200, 'Expenditure deleted successfully', removed);
  } catch (error) {
    return next(error);
  }
};

module.exports = { listExpenditures, createExpenditure, updateExpenditure, deleteExpenditure };
