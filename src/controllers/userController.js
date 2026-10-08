const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');

const { db, withTransaction } = require('../services/db');
const repo = require('../services/repository');
const { ROLES } = require('../config/roles');
const { HttpError } = require('../utils/httpError');
const { sendResponse } = require('../utils/response');

const BCRYPT_ROUNDS = 12;

const listUsers = async (_req, res) => {
  const users = await repo.listUsers(db);
  return sendResponse(res, 200, 'Users fetched successfully', users.map(repo.toPublicUser));
};

const createUser = async (req, res) => {
  const user = await withTransaction(async (client) => {
    const email = req.body.email.toLowerCase();

    if (await repo.findUserByEmail(client, email)) {
      throw new HttpError(409, 'A user with this email already exists', [email]);
    }

    const created = {
      id: randomUUID(),
      name: req.body.name,
      email,
      role: req.body.role,
      passwordHash: await bcrypt.hash(req.body.password, BCRYPT_ROUNDS),
      isActive: true,
    };

    await repo.insertUser(client, created);
    await repo.insertAuditLog(client, 'CREATE', 'user', { id: created.id, email, role: created.role }, req.user.email);
    return created;
  });

  return sendResponse(res, 201, 'User created successfully', repo.toPublicUser(user));
};

// Rejects any change that would leave the portal without an active super admin.
const assertSuperAdminRemains = async (client, existing, updated) => {
  const wasActiveSuperAdmin = existing.role === ROLES.SUPER_ADMIN && existing.isActive;
  const staysActiveSuperAdmin = updated.role === ROLES.SUPER_ADMIN && updated.isActive;

  if (wasActiveSuperAdmin && !staysActiveSuperAdmin && (await repo.countActiveSuperAdmins(client)) <= 1) {
    throw new HttpError(409, 'At least one active super admin is required', []);
  }
};

const updateUser = async (req, res) => {
  const user = await withTransaction(async (client) => {
    const existing = await repo.findUserById(client, req.params.id, { forUpdate: true });

    if (!existing) {
      throw new HttpError(404, 'User not found', [req.params.id]);
    }

    const updated = {
      ...existing,
      name: req.body.name ?? existing.name,
      email: req.body.email ? req.body.email.toLowerCase() : existing.email,
      role: req.body.role ?? existing.role,
      isActive: req.body.isActive ?? existing.isActive,
    };

    if (existing.id === req.user.sub && (updated.role !== existing.role || updated.isActive !== existing.isActive)) {
      throw new HttpError(409, 'You cannot change your own role or deactivate your own account', []);
    }

    if (updated.email !== existing.email) {
      const taken = await repo.findUserByEmail(client, updated.email);
      if (taken && taken.id !== existing.id) {
        throw new HttpError(409, 'A user with this email already exists', [updated.email]);
      }
    }

    await assertSuperAdminRemains(client, existing, updated);
    await repo.saveUser(client, updated);
    await repo.insertAuditLog(
      client,
      'UPDATE',
      'user',
      { id: updated.id, email: updated.email, role: updated.role, isActive: updated.isActive },
      req.user.email,
    );
    return updated;
  });

  return sendResponse(res, 200, 'User updated successfully', repo.toPublicUser(user));
};

const resetPassword = async (req, res) => {
  await withTransaction(async (client) => {
    const existing = await repo.findUserById(client, req.params.id, { forUpdate: true });

    if (!existing) {
      throw new HttpError(404, 'User not found', [req.params.id]);
    }

    await repo.setUserPasswordHash(client, existing.id, await bcrypt.hash(req.body.password, BCRYPT_ROUNDS));
    await repo.insertAuditLog(client, 'RESET_PASSWORD', 'user', { id: existing.id, email: existing.email }, req.user.email);
  });

  return sendResponse(res, 200, 'Password updated successfully');
};

module.exports = { listUsers, createUser, updateUser, resetPassword };
