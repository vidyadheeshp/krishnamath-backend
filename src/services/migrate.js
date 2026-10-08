// Minimal idempotent migration runner: applies src/data/migrations/*.sql once each, in name order.
const fs = require('fs');
const path = require('path');

const { withTransaction } = require('./db');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'data', 'migrations');

const runMigrations = async () => {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  await withTransaction(async (client) => {
    // Serialise concurrent app instances starting at the same time.
    await client.query('SELECT pg_advisory_xact_lock(727001)');
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())',
    );

    const applied = new Set((await client.query('SELECT name FROM schema_migrations')).rows.map((row) => row.name));

    for (const file of files) {
      if (applied.has(file)) {
        continue;
      }

      await client.query(fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'));
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      console.log(`Applied migration ${file}`);
    }
  });
};

module.exports = { runMigrations };
