const express = require('express');

const { cancelReceipt, createReceipt, listReceipts, updateReceipt } = require('../controllers/receiptController');
const { createReceiptRules, periodRules, updateReceiptRules } = require('../validators');

const router = express.Router();

router.get('/', periodRules, listReceipts);
router.post('/', createReceiptRules, createReceipt);
router.put('/:id', updateReceiptRules, updateReceipt);
router.delete('/:id', cancelReceipt);

module.exports = router;
