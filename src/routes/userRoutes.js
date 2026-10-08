const express = require('express');

const { createUser, listUsers, resetPassword, updateUser } = require('../controllers/userController');
const { createUserRules, resetPasswordRules, updateUserRules } = require('../validators');

const router = express.Router();

router.get('/', listUsers);
router.post('/', createUserRules, createUser);
router.put('/:id', updateUserRules, updateUser);
router.post('/:id/reset-password', resetPasswordRules, resetPassword);

module.exports = router;
