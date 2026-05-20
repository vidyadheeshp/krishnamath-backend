const express = require('express');
const { body } = require('express-validator');

const { login, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  login,
);
router.get('/me', authenticate, me);

module.exports = router;
