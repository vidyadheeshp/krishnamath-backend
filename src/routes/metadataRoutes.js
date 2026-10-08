const express = require('express');

const {
  createMetadata,
  deleteMetadata,
  getMetadata,
  updateMetadata,
} = require('../controllers/metadataController');
const { createMetadataRules, updateMetadataRules } = require('../validators');

const router = express.Router();

router.get('/:type', getMetadata);
router.post('/:type', createMetadataRules, createMetadata);
router.put('/:type/:id', updateMetadataRules, updateMetadata);
router.delete('/:type/:id', deleteMetadata);

module.exports = router;
