const express = require('express');

const { addBlockedDates, listBlockedDates, removeBlockedDate, updateBlockedDate } = require('../controllers/blockedDateController');
const { addBlockedDatesRules, listBlockedDatesRules, updateBlockedDateRules } = require('../validators');

const router = express.Router();

router.get('/', listBlockedDatesRules, listBlockedDates);
router.post('/', addBlockedDatesRules, addBlockedDates);
router.put('/:id', updateBlockedDateRules, updateBlockedDate);
router.delete('/:id', removeBlockedDate);

module.exports = router;
