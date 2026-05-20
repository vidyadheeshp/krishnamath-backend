const express = require('express');

const {
  createExpenditure,
  deleteExpenditure,
  listExpenditures,
  updateExpenditure,
} = require('../controllers/expenditureController');

const router = express.Router();

router.get('/', listExpenditures);
router.post('/', createExpenditure);
router.put('/:id', updateExpenditure);
router.delete('/:id', deleteExpenditure);

module.exports = router;
