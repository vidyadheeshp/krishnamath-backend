const { Pool } = require('pg');

const { env } = require('../config/env');

let pool;

const getPool = () => {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is not configured. Set it in backend/.env before starting the API.');
  }

  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl,
      max: env.dbPoolMax,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    pool.on('error', (error) => console.error('Unexpected PostgreSQL pool error', error));
  }

  return pool;
};

// Anything with a `.query(text, params)` method: this facade (auto-pooled) or a transaction client.
const db = { query: (text, params) => getPool().query(text, params) };

const withTransaction = async (work) => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback failed', rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
};

const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
};

module.exports = { db, withTransaction, closePool };
