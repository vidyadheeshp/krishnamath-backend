const express = require('express');

const { listPanchang } = require('../controllers/panchangController');
const { panchangRules } = require('../validators');

const router = express.Router();

router.get('/', panchangRules, listPanchang);

module.exports = router;
