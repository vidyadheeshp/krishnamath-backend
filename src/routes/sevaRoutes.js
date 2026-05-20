const express = require('express');

const { createSeva, deleteSeva, listSevas, updateSeva } = require('../controllers/sevaController');

const router = express.Router();

router.get('/', listSevas);
router.post('/', createSeva);
router.put('/:id', updateSeva);
router.delete('/:id', deleteSeva);

module.exports = router;
