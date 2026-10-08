// Usage: node scripts/seed-users.js
// Promotes the existing owner account to super admin and creates the staff accounts if missing.
// Generated passwords are printed once; existing accounts are never given a new password here.
// Change SUPER_ADMIN_EMAIL / STAFF below (or rename accounts later from the Users page).
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const bcrypt = require('bcrypt');
const { randomBytes, randomUUID } = require('crypto');

const { db, withTransaction, closePool } = require('../src/services/db');
const { runMigrations } = require('../src/services/migrate');
const repo = require('../src/services/repository');

const SUPER_ADMIN_EMAIL = 'admin@krishnamath.co.in';

const STAFF = [
  { name: 'Admin One', email: 'admin1@krishnamath.co.in', role: 'admin' },
  { name: 'Admin Two', email: 'admin2@krishnamath.co.in', role: 'admin' },
  { name: 'Accounts and Finance Head', email: 'finance@krishnamath.co.in', role: 'finance' },
];

// Unambiguous characters only (no 0/O, 1/l/I) so the password can be read out or typed from a note.
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generatePassword = (length = 14) =>
  Array.from(randomBytes(length), (byte) => ALPHABET[byte % ALPHABET.length]).join('');

const run = async () => {
  await repo.ensureSchema(db);
  await runMigrations();

  const created = [];

  await withTransaction(async (client) => {
    const owner = await repo.findUserByEmail(client, SUPER_ADMIN_EMAIL);

    if (!owner) {
      throw new Error(`Owner account ${SUPER_ADMIN_EMAIL} was not found in this database.`);
    }

    if (owner.role !== 'super-admin' || !owner.isActive) {
      await repo.saveUser(client, { ...owner, role: 'super-admin', isActive: true });
      await repo.insertAuditLog(client, 'UPDATE', 'user', { email: owner.email, role: 'super-admin' }, 'seed-users');
      console.log(`${owner.email} is now a super admin.`);
    } else {
      console.log(`${owner.email} is already a super admin.`);
    }

    for (const account of STAFF) {
      if (await repo.findUserByEmail(client, account.email)) {
        console.log(`${account.email} already exists - left unchanged.`);
        continue;
      }

      const password = generatePassword();
      await repo.insertUser(client, {
        id: randomUUID(),
        name: account.name,
        email: account.email,
        role: account.role,
        passwordHash: await bcrypt.hash(password, 12),
        isActive: true,
      });
      await repo.insertAuditLog(client, 'CREATE', 'user', { email: account.email, role: account.role }, 'seed-users');
      created.push({ ...account, password });
    }
  });

  if (created.length > 0) {
    console.log('\nNew accounts (shown once - store them safely and change them after first login):');
    created.forEach((account) => console.log(`  ${account.role.padEnd(8)} ${account.email.padEnd(32)} ${account.password}`));
  }
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(closePool);
