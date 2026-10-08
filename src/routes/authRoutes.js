const express = require('express');
const rateLimit = require('express-rate-limit');

const { changePassword, login, me, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { changePasswordRules, loginRules, profileRules, validate } = require('../validators');

const router = express.Router();

// Brute-force protection: failed attempts count against the limit, successful logins do not.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.', data: null, errors: [] },
});

// Brute-force protection for the actions that ask for the current password: only wrong-password
// guesses count against the limit, so validation mistakes and successful edits never lock anyone out.
const accountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (_req, res) => !res.locals.passwordFailed,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.', data: null, errors: [] },
});

router.post('/login', loginLimiter, loginRules, validate, login);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, accountLimiter, profileRules, updateProfile);
router.put('/password', authenticate, accountLimiter, changePasswordRules, changePassword);

module.exports = router;
