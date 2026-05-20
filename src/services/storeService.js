const { randomUUID } = require('crypto');
const { Pool } = require('pg');

const { env } = require('../config/env');

const metadataTableMap = {
  gotras: 'metadata_gotras',
  nakshatras: 'metadata_nakshatras',
  raashis: 'metadata_raashis',
  paymentModes: 'metadata_payment_modes',
  eventTypes: 'metadata_event_types',
  sevaCategories: 'metadata_seva_categories',
};

const requiredTables = [
  'users',
  'metadata_gotras',
  'metadata_nakshatras',
  'metadata_raashis',
  'metadata_payment_modes',
  'metadata_event_types',
  'metadata_seva_categories',
  'devotees',
  'sevas',
  'bookings',
  'expenditures',
  'notifications',
  'audit_logs',
];

let pool;

const getPool = () => {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is not configured. Set it in backend/.env before starting the API.');
  }

  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl,
    });
  }

  return pool;
};

const toIsoString = (value) => {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : String(value);
};

const toNumber = (value) => (value === null || value === undefined ? 0 : Number(value));

const tableExists = async (client, tableName) => {
  const result = await client.query('SELECT to_regclass($1) AS table_name', [`public.${tableName}`]);
  return Boolean(result.rows[0]?.table_name);
};

const mapUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  passwordHash: row.password_hash,
  lastLoginAt: toIsoString(row.last_login_at),
});

const mapMetadata = (row) => ({
  id: row.id,
  name: row.name,
  nameKn: row.name_kn || '',
  enabled: row.enabled,
});

const mapDevotee = (row) => ({
  id: row.id,
  name: row.name,
  mobileNumber: row.mobile_number,
  address: row.address,
  gotra: row.gotra,
  nakshatra: row.nakshatra,
  raashi: row.raashi,
});

const mapSeva = (row) => ({
  id: row.id,
  name: row.name,
  nameKn: row.name_kn || '',
  description: row.description,
  amount: toNumber(row.amount),
  duration: toNumber(row.duration),
  category: row.category,
  maxBookingsPerDay: toNumber(row.max_bookings_per_day),
  availabilityStatus: row.availability_status,
  instructions: row.instructions,
});

const mapBooking = (row) => {
  const devoteeSnapshot = row.devotee_snapshot || {};
  const sevaIdsFromSnapshot = Array.isArray(devoteeSnapshot._sevaIds)
    ? [...new Set(devoteeSnapshot._sevaIds.filter(Boolean))]
    : [];
  const { _sevaIds, ...devotee } = devoteeSnapshot;
  void _sevaIds;

  return {
    id: row.id,
    devotee,
    devoteeId: row.devotee_id,
    sevaId: row.seva_id,
    sevaIds: sevaIdsFromSnapshot.length > 0 ? sevaIdsFromSnapshot : row.seva_id ? [row.seva_id] : [],
    bookingDate: row.booking_date,
    bookingTime: typeof row.booking_time === 'string' ? row.booking_time.slice(0, 5) : row.booking_time,
    status: row.status,
    paymentMode: row.payment_mode,
    paymentReferenceNumber: row.payment_reference_number,
    amountPayable: toNumber(row.amount_payable),
    discount: toNumber(row.discount),
    amountCollected: toNumber(row.amount_collected),
    notes: row.notes,
    receiptNumber: row.receipt_number,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
};

const mapExpenditure = (row) => ({
  id: row.id,
  expenseTitle: row.expense_title,
  expenseCategory: row.expense_category,
  expenseAmount: toNumber(row.expense_amount),
  expenseDate: row.expense_date,
  paymentMode: row.payment_mode,
  vendorDetails: row.vendor_details,
  notes: row.notes,
});

const mapNotification = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  type: row.type,
  createdAt: toIsoString(row.created_at),
});

const mapAuditLog = (row) => ({
  id: row.id,
  action: row.action,
  entity: row.entity,
  actor: row.actor,
  payload: row.payload,
  createdAt: toIsoString(row.created_at),
});

const ensureStore = async () => {
  const client = await getPool().connect();

  try {
    for (const tableName of requiredTables) {
      const exists = await tableExists(client, tableName);
      if (!exists) {
        throw new Error(
          `Required PostgreSQL table "${tableName}" was not found. Import backend/src/data/krishnamath_pgadmin_import.sql into the configured database first.`,
        );
      }
    }
  } finally {
    client.release();
  }
};

const readStore = async () => {
  await ensureStore();
  const db = getPool();

  const [
    usersResult,
    gotrasResult,
    nakshatrasResult,
    raashisResult,
    paymentModesResult,
    eventTypesResult,
    sevaCategoriesResult,
    devoteesResult,
    sevasResult,
    bookingsResult,
    expendituresResult,
    notificationsResult,
    auditLogsResult,
  ] = await Promise.all([
    db.query('SELECT id, name, email, role, password_hash, last_login_at FROM users ORDER BY name ASC'),
    db.query('SELECT id, name, name_kn, enabled FROM metadata_gotras ORDER BY name ASC'),
    db.query('SELECT id, name, name_kn, enabled FROM metadata_nakshatras ORDER BY name ASC'),
    db.query('SELECT id, name, name_kn, enabled FROM metadata_raashis ORDER BY name ASC'),
    db.query('SELECT id, name, name_kn, enabled FROM metadata_payment_modes ORDER BY name ASC'),
    db.query('SELECT id, name, name_kn, enabled FROM metadata_event_types ORDER BY name ASC'),
    db.query('SELECT id, name, name_kn, enabled FROM metadata_seva_categories ORDER BY name ASC'),
    db.query('SELECT id, name, mobile_number, address, gotra, nakshatra, raashi FROM devotees ORDER BY name ASC'),
    db.query(
      'SELECT id, name, name_kn, description, amount, duration, category, max_bookings_per_day, availability_status, instructions FROM sevas ORDER BY name ASC',
    ),
    db.query(
      'SELECT id, devotee_id, seva_id, devotee_snapshot, booking_date::text AS booking_date, booking_time::text AS booking_time, status, payment_mode, payment_reference_number, amount_payable, discount, amount_collected, notes, receipt_number, created_at, updated_at FROM bookings ORDER BY created_at DESC',
    ),
    db.query(
      'SELECT id, expense_title, expense_category, expense_amount, expense_date::text AS expense_date, payment_mode, vendor_details, notes FROM expenditures ORDER BY expense_date DESC, id DESC',
    ),
    db.query('SELECT id, title, description, type, created_at FROM notifications ORDER BY created_at DESC'),
    db.query('SELECT id, action, entity, actor, payload, created_at FROM audit_logs ORDER BY created_at DESC'),
  ]);

  return {
    users: usersResult.rows.map(mapUser),
    metadata: {
      gotras: gotrasResult.rows.map(mapMetadata),
      nakshatras: nakshatrasResult.rows.map(mapMetadata),
      raashis: raashisResult.rows.map(mapMetadata),
      paymentModes: paymentModesResult.rows.map(mapMetadata),
      eventTypes: eventTypesResult.rows.map(mapMetadata),
      sevaCategories: sevaCategoriesResult.rows.map(mapMetadata),
    },
    devotees: devoteesResult.rows.map(mapDevotee),
    sevas: sevasResult.rows.map(mapSeva),
    bookings: bookingsResult.rows.map(mapBooking),
    expenditures: expendituresResult.rows.map(mapExpenditure),
    notifications: notificationsResult.rows.map(mapNotification),
    auditLogs: auditLogsResult.rows.map(mapAuditLog),
  };
};

const insertMetadataCollection = async (client, type, entries) => {
  const tableName = metadataTableMap[type];

  for (const entry of entries) {
    await client.query(`INSERT INTO ${tableName} (id, name, name_kn, enabled) VALUES ($1, $2, $3, $4)`, [
      entry.id,
      entry.name,
      entry.nameKn || '',
      entry.enabled,
    ]);
  }
};

const writeStore = async (store) => {
  await ensureStore();
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    await client.query(
      'TRUNCATE TABLE audit_logs, notifications, expenditures, bookings, sevas, devotees, metadata_seva_categories, metadata_event_types, metadata_payment_modes, metadata_raashis, metadata_nakshatras, metadata_gotras, users CASCADE',
    );

    for (const user of store.users) {
      await client.query(
        'INSERT INTO users (id, name, email, role, password_hash, last_login_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [user.id, user.name, user.email, user.role, user.passwordHash, user.lastLoginAt],
      );
    }

    for (const [type, entries] of Object.entries(store.metadata)) {
      await insertMetadataCollection(client, type, entries);
    }

    for (const devotee of store.devotees) {
      await client.query(
        'INSERT INTO devotees (id, name, mobile_number, address, gotra, nakshatra, raashi) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          devotee.id,
          devotee.name,
          devotee.mobileNumber,
          devotee.address,
          devotee.gotra,
          devotee.nakshatra,
          devotee.raashi,
        ],
      );
    }

    for (const seva of store.sevas) {
      await client.query(
        'INSERT INTO sevas (id, name, name_kn, description, amount, duration, category, max_bookings_per_day, availability_status, instructions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [
          seva.id,
          seva.name,
          seva.nameKn || '',
          seva.description,
          seva.amount,
          seva.duration,
          seva.category,
          seva.maxBookingsPerDay,
          seva.availabilityStatus,
          seva.instructions,
        ],
      );
    }

    for (const booking of store.bookings) {
      const normalizedSevaIds = Array.isArray(booking.sevaIds) && booking.sevaIds.length > 0
        ? [...new Set(booking.sevaIds.filter(Boolean))]
        : booking.sevaId
          ? [booking.sevaId]
          : [];
      const primarySevaId = booking.sevaId || normalizedSevaIds[0] || null;

      await client.query(
        'INSERT INTO bookings (id, devotee_id, seva_id, devotee_snapshot, booking_date, booking_time, status, payment_mode, payment_reference_number, amount_payable, discount, amount_collected, notes, receipt_number, created_at, updated_at) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)',
        [
          booking.id,
          booking.devoteeId,
          primarySevaId,
          JSON.stringify({ ...booking.devotee, _sevaIds: normalizedSevaIds }),
          booking.bookingDate,
          booking.bookingTime,
          booking.status,
          booking.paymentMode,
          booking.paymentReferenceNumber,
          booking.amountPayable,
          booking.discount,
          booking.amountCollected,
          booking.notes,
          booking.receiptNumber,
          booking.createdAt,
          booking.updatedAt,
        ],
      );
    }

    for (const expenditure of store.expenditures) {
      await client.query(
        'INSERT INTO expenditures (id, expense_title, expense_category, expense_amount, expense_date, payment_mode, vendor_details, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          expenditure.id,
          expenditure.expenseTitle,
          expenditure.expenseCategory,
          expenditure.expenseAmount,
          expenditure.expenseDate,
          expenditure.paymentMode,
          expenditure.vendorDetails,
          expenditure.notes,
        ],
      );
    }

    for (const notification of store.notifications) {
      await client.query(
        'INSERT INTO notifications (id, title, description, type, created_at) VALUES ($1, $2, $3, $4, $5)',
        [notification.id, notification.title, notification.description, notification.type, notification.createdAt],
      );
    }

    for (const auditLog of store.auditLogs) {
      await client.query(
        'INSERT INTO audit_logs (id, action, entity, actor, payload, created_at) VALUES ($1, $2, $3, $4, $5::jsonb, $6)',
        [auditLog.id, auditLog.action, auditLog.entity, auditLog.actor, JSON.stringify(auditLog.payload), auditLog.createdAt],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const appendAuditLog = (store, action, entity, payload, actor = 'system') => {
  store.auditLogs.unshift({
    id: randomUUID(),
    action,
    entity,
    actor,
    payload,
    createdAt: new Date().toISOString(),
  });
};

module.exports = { ensureStore, readStore, writeStore, appendAuditLog };
