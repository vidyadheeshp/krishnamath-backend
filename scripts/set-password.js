// Usage: node scripts/set-password.js <email> <new-password>
// Resets a user's password (bcrypt-hashed) directly in the configured database.
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcrypt');

const { db, closePool } = require('../src/services/db');

const [email, password] = process.argv.slice(2);

const run = async () => {
  if (!email || !password) {
    throw new Error('Usage: node scripts/set-password.js <email> <new-password>');
  }

  if (password.length < 10) {
    throw new Error('Password must be at least 10 characters.');
  }

  const hash = await bcrypt.hash(password, 12);
  const result = await db.query('UPDATE users SET password_hash = $1 WHERE lower(email) = lower($2)', [hash, email]);

  if (result.rowCount === 0) {
    throw new Error(`No user found with email ${email}`);
  }

  console.log(`Password updated for ${email}`);
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(closePool);
