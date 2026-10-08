const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const { db } = require('../services/db');
const { findUserById } = require('../services/repository');

const reject = (res, statusCode, message, error) =>
  res.status(statusCode).json({ success: false, message, data: null, errors: [error] });

// Verifies the token, then loads the account so role changes and deactivation take effect
// immediately instead of waiting for the token to expire.
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reject(res, 401, 'Authentication required', 'Missing bearer token');
  }

  let payload;
  try {
    payload = jwt.verify(authHeader.slice('Bearer '.length), env.jwtSecret, { algorithms: ['HS256'] });
  } catch (_error) {
    return reject(res, 401, 'Invalid or expired token', 'Invalid token');
  }

  const user = await findUserById(db, payload.sub);

  if (!user || !user.isActive) {
    return reject(res, 401, 'Account is not active', 'Inactive account');
  }

  req.user = { sub: user.id, name: user.name, email: user.email, role: user.role };
  return next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return reject(res, 403, 'You do not have access to this resource', 'Forbidden');
  }

  return next();
};

module.exports = { authenticate, authorize };
