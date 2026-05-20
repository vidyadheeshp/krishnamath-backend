const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { env } = require('./config/env');
const apiRouter = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();
const allowedOrigins = Array.from(
  new Set([
    env.clientUrl,
    env.clientUrl.replace('localhost', '127.0.0.1'),
    env.clientUrl.replace('127.0.0.1', 'localhost'),
  ]),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin ${origin}`));
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Temple API is healthy', data: null, errors: [] });
});

app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
