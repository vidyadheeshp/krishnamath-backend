const express = require('express');

const {
  createMetadata,
  deleteMetadata,
  getMetadata,
  updateMetadata,
} = require('../controllers/metadataController');

const router = express.Router();

router.get('/:type', getMetadata);
router.post('/:type', createMetadata);
router.put('/:type/:id', updateMetadata);
router.delete('/:type/:id', deleteMetadata);

module.exports = router;
