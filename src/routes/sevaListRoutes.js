const express = require('express');

const { getSevaList } = require('../controllers/sevaListController');
const { sevaListRules } = require('../validators');

const router = express.Router();

router.get('/', sevaListRules, getSevaList);

module.exports = router;
