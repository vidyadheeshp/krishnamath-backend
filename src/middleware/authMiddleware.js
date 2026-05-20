const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      data: null,
      errors: ['Missing bearer token'],
    });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      data: null,
      errors: [error.message],
    });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this resource',
      data: null,
      errors: ['Forbidden'],
    });
  }

  return next();
};

module.exports = { authenticate, authorize };
