const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const { env } = require('../config/env');
const { appendAuditLog, readStore, writeStore } = require('../services/storeService');
const { sendResponse } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, 'Validation failed', null, errors.array().map((item) => item.msg));
    }

    const { email, password } = req.body;
    const store = await readStore();
    const user = store.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return sendResponse(res, 401, 'Invalid email or password', null, ['User not found']);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return sendResponse(res, 401, 'Invalid email or password', null, ['Incorrect password']);
    }

    user.lastLoginAt = new Date().toISOString();
    appendAuditLog(store, 'LOGIN', 'user', { userId: user.id }, user.email);
    await writeStore(store);

    const token = jwt.sign(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn },
    );

    return sendResponse(res, 200, 'Login successful', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      credentialsHint: 'Use admin@temple.local / Temple@123',
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res) => {
  return sendResponse(res, 200, 'Authenticated user loaded', {
    id: req.user.sub,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
};

module.exports = { login, me };
