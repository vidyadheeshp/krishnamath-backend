const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./src/app');
const { env } = require('./src/config/env');
const { ensureStore } = require('./src/services/storeService');

const startServer = async () => {
  await ensureStore();

  app.listen(env.port, () => {
    console.log(`Temple API listening on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
