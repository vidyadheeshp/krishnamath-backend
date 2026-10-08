const { env } = require('../config/env');

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    data: null,
    errors: [],
  });
};

// PostgreSQL error codes worth translating into client errors.
const PG_ERRORS = {
  '23503': { statusCode: 409, message: 'This record is linked to other data and cannot be changed or removed' },
  '23505': { statusCode: 409, message: 'A record with the same value already exists' },
  '23502': { statusCode: 400, message: 'A required value is missing' },
  '22P02': { statusCode: 400, message: 'A value has an invalid format' },
};

const errorHandler = (error, _req, res, _next) => {
  if (error.passwordMismatch) {
    res.locals.passwordFailed = true;
  }

  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || 'Internal server error';
  let errors = error.errors || [];

  if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body is not valid JSON';
  } else if (PG_ERRORS[error.code]) {
    ({ statusCode, message } = PG_ERRORS[error.code]);
    errors = [];
  }

  if (statusCode >= 500) {
    console.error(error);
    if (env.isProduction) {
      message = 'Internal server error';
      errors = [];
    }
  }

  res.status(statusCode).json({ success: false, message, data: null, errors });
};

module.exports = { notFoundHandler, errorHandler };
