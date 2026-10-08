const express = require('express');

const {
  createExpenditure,
  deleteExpenditure,
  listExpenditures,
  updateExpenditure,
} = require('../controllers/expenditureController');
const { createExpenditureRules, updateExpenditureRules } = require('../validators');

const router = express.Router();

router.get('/', listExpenditures);
router.post('/', createExpenditureRules, createExpenditure);
router.put('/:id', updateExpenditureRules, updateExpenditure);
router.delete('/:id', deleteExpenditure);

module.exports = router;
