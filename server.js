const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./src/app');
const { env } = require('./src/config/env');
const { db, closePool } = require('./src/services/db');
const { runMigrations } = require('./src/services/migrate');
const { ensureSchema } = require('./src/services/repository');

const startServer = async () => {
  await ensureSchema(db);
  await runMigrations();

  const server = app.listen(env.port, () => {
    console.log(`Temple API listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
