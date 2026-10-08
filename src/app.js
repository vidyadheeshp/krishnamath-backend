const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { env } = require('./config/env');
const apiRouter = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// Behind Nginx / a PaaS proxy the real client IP comes from X-Forwarded-For; without this
// every user shares the proxy's IP and the rate limiters would lock everyone out together.
if (env.trustProxy) {
  app.set('trust proxy', /^\d+$/.test(env.trustProxy) ? Number(env.trustProxy) : env.trustProxy);
}

const allowedOrigins = new Set(
  env.clientUrls.flatMap((url) => [url, url.replace('localhost', '127.0.0.1'), url.replace('127.0.0.1', 'localhost')]),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      const error = new Error(`CORS blocked for origin ${origin}`);
      error.statusCode = 403;
      return callback(error);
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(morgan(env.isProduction ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Temple API is healthy', data: null, errors: [] });
});

app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
