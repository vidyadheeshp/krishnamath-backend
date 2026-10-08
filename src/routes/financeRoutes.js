const express = require('express');

const { getExpenditureExport, getExpenditures, getOverview, getPayments, getTallyExport } = require('../controllers/financeController');
const { periodRules } = require('../validators');

const router = express.Router();

router.get('/overview', periodRules, getOverview);
router.get('/payments', periodRules, getPayments);
router.get('/expenditures', periodRules, getExpenditures);
router.get('/export', periodRules, getTallyExport);
router.get('/export-expenditures', periodRules, getExpenditureExport);

module.exports = router;
