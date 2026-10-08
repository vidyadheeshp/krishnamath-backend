const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const { db, withTransaction } = require('../services/db');
const repo = require('../services/repository');
const { HttpError } = require('../utils/httpError');
const { sendResponse } = require('../utils/response');

// Compared against when the email is unknown so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await repo.findUserByEmail(db, email);

  const passwordMatches = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

  if (!user || !user.isActive || !passwordMatches) {
    await repo.insertAuditLog(db, 'LOGIN_FAILED', 'user', { email }, String(email).slice(0, 254));
    return sendResponse(res, 401, 'Invalid email or password', null, []);
  }

  await repo.touchUserLogin(db, user.id);
  await repo.insertAuditLog(db, 'LOGIN', 'user', { userId: user.id }, user.email);

  const token = jwt.sign({ sub: user.id, name: user.name, email: user.email, role: user.role }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: env.jwtExpiresIn,
  });

  return sendResponse(res, 200, 'Login successful', {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};

const BCRYPT_ROUNDS = 12;

// What a person may see about their own account (never the password hash).
const toProfile = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  lastLoginAt: user.lastLoginAt,
});

const me = async (req, res) => {
  const user = await repo.findUserById(db, req.user.sub);
  return sendResponse(res, 200, 'Authenticated user loaded', toProfile(user));
};

// Wrong current passwords are answered with 400 (not 401): a 401 means "your session is invalid" and
// signs the person out of the app.
const assertCurrentPassword = async (user, password) => {
  if (!password || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new HttpError(400, 'Current password is incorrect', ['currentPassword']);
    // Lets the rate limiter count genuine wrong-password guesses, but not ordinary typing mistakes.
    error.passwordMismatch = true;
    throw error;
  }
};

// Name, email and mobile number. Role and active status can only be changed by a super admin.
// Changing the email (the sign-in name) also needs the current password.
const updateProfile = async (req, res) => {
  const profile = await withTransaction(async (client) => {
    const existing = await repo.findUserById(client, req.user.sub, { forUpdate: true });
    const nextEmail = req.body.email ? req.body.email.toLowerCase() : existing.email;

    if (nextEmail !== existing.email) {
      if (!req.body.currentPassword) {
        throw new HttpError(400, 'Enter your current password to change your email address', ['currentPassword']);
      }
      await assertCurrentPassword(existing, req.body.currentPassword);

      const taken = await repo.findUserByEmail(client, nextEmail);
      if (taken && taken.id !== existing.id) {
        throw new HttpError(409, 'A user with this email already exists', [nextEmail]);
      }
    }

    const updated = {
      ...existing,
      name: req.body.name ?? existing.name,
      email: nextEmail,
      phone: req.body.phone ?? existing.phone,
    };

    await repo.saveUser(client, updated);
    await repo.insertAuditLog(
      client,
      'UPDATE_PROFILE',
      'user',
      {
        id: existing.id,
        before: { name: existing.name, email: existing.email, phone: existing.phone },
        after: { name: updated.name, email: updated.email, phone: updated.phone },
      },
      // The actor is recorded under the email they were signed in with.
      existing.email,
    );
    return updated;
  });

  return sendResponse(res, 200, 'Profile updated successfully', toProfile(profile));
};

const changePassword = async (req, res) => {
  await withTransaction(async (client) => {
    const existing = await repo.findUserById(client, req.user.sub, { forUpdate: true });
    await assertCurrentPassword(existing, req.body.currentPassword);

    if (req.body.newPassword === req.body.currentPassword) {
      throw new HttpError(400, 'The new password must be different from the current one', ['newPassword']);
    }

    await repo.setUserPasswordHash(client, existing.id, await bcrypt.hash(req.body.newPassword, BCRYPT_ROUNDS));
    await repo.insertAuditLog(client, 'CHANGE_PASSWORD', 'user', { id: existing.id, email: existing.email }, existing.email);
  });

  return sendResponse(res, 200, 'Password changed successfully');
};

module.exports = { login, me, updateProfile, changePassword };
