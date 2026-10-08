const express = require('express');

const { createSeva, deleteSeva, listSevas, updateSeva } = require('../controllers/sevaController');
const { createSevaRules, updateSevaRules } = require('../validators');

const router = express.Router();

router.get('/', listSevas);
router.post('/', createSevaRules, createSeva);
router.put('/:id', updateSevaRules, updateSeva);
router.delete('/:id', deleteSeva);

module.exports = router;
