// Per-entity data access. Every function takes a `db` (the pooled `db` facade or a
// transaction client) as its first argument so callers decide the transaction boundary.
const { randomUUID } = require('crypto');

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
  ...Object.values(metadataTableMap),
  'devotees',
  'sevas',
  'bookings',
  'expenditures',
  'notifications',
  'audit_logs',
];

const toIsoString = (value) => {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : String(value);
};

const toNumber = (value) => (value === null || value === undefined ? 0 : Number(value));

const lockClause = (forUpdate) => (forUpdate ? ' FOR UPDATE' : '');

// ---------------------------------------------------------------- schema check

const ensureSchema = async (db) => {
  const result = await db.query(
    "SELECT t AS table_name, to_regclass('public.' || t) IS NOT NULL AS present FROM unnest($1::text[]) AS t",
    [requiredTables],
  );
  const missing = result.rows.filter((row) => !row.present).map((row) => row.table_name);

  if (missing.length > 0) {
    throw new Error(
      `Required PostgreSQL tables not found: ${missing.join(', ')}. Import backend/src/data/krishnamath_pgadmin_import.sql into the configured database first.`,
    );
  }
};

// ----------------------------------------------------------------------- users

const USER_COLUMNS = 'id, name, email, phone, role, password_hash, last_login_at, is_active';

const mapUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone || '',
  role: row.role,
  passwordHash: row.password_hash,
  lastLoginAt: toIsoString(row.last_login_at),
  isActive: row.is_active,
});

// Never include the password hash in API output.
const toPublicUser = ({ passwordHash, ...user }) => user;

const findUserByEmail = async (db, email) => {
  const result = await db.query(`SELECT ${USER_COLUMNS} FROM users WHERE lower(email) = lower($1)`, [email]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
};

const findUserById = async (db, id, { forUpdate = false } = {}) => {
  const result = await db.query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1${lockClause(forUpdate)}`, [id]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
};

const listUsers = async (db) => {
  const result = await db.query(`SELECT ${USER_COLUMNS} FROM users ORDER BY name ASC`);
  return result.rows.map(mapUser);
};

const insertUser = async (db, user) => {
  await db.query(
    'INSERT INTO users (id, name, email, role, password_hash, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
    [user.id, user.name, user.email, user.role, user.passwordHash, user.isActive],
  );
  return user;
};

const saveUser = async (db, user) => {
  await db.query('UPDATE users SET name = $2, email = $3, role = $4, is_active = $5, phone = $6 WHERE id = $1', [
    user.id,
    user.name,
    user.email,
    user.role,
    user.isActive,
    user.phone ?? '',
  ]);
  return user;
};

const setUserPasswordHash = (db, id, passwordHash) =>
  db.query('UPDATE users SET password_hash = $2 WHERE id = $1', [id, passwordHash]);

// Locks the active super admins so two concurrent changes cannot both remove the last one.
const countActiveSuperAdmins = async (db) => {
  const result = await db.query(
    "SELECT id FROM users WHERE role = 'super-admin' AND is_active = TRUE FOR UPDATE",
  );
  return result.rowCount;
};

const touchUserLogin = (db, id) => db.query('UPDATE users SET last_login_at = now() WHERE id = $1', [id]);

// -------------------------------------------------------------------- metadata

const isMetadataType = (type) => Object.prototype.hasOwnProperty.call(metadataTableMap, type);

const mapMetadata = (row) => ({
  id: row.id,
  name: row.name,
  nameKn: row.name_kn || '',
  enabled: row.enabled,
});

const listMetadata = async (db, type) => {
  const result = await db.query(`SELECT id, name, name_kn, enabled FROM ${metadataTableMap[type]} ORDER BY name ASC`);
  return result.rows.map(mapMetadata);
};

const findMetadata = async (db, type, id, { forUpdate = false } = {}) => {
  const result = await db.query(
    `SELECT id, name, name_kn, enabled FROM ${metadataTableMap[type]} WHERE id = $1${lockClause(forUpdate)}`,
    [id],
  );
  return result.rows[0] ? mapMetadata(result.rows[0]) : null;
};

const metadataNameExists = async (db, type, name, excludeId = null) => {
  const result = await db.query(
    `SELECT 1 FROM ${metadataTableMap[type]} WHERE lower(name) = lower($1) AND ($2::text IS NULL OR id <> $2) LIMIT 1`,
    [name, excludeId],
  );
  return result.rowCount > 0;
};

const insertMetadata = async (db, type, item) => {
  await db.query(`INSERT INTO ${metadataTableMap[type]} (id, name, name_kn, enabled) VALUES ($1, $2, $3, $4)`, [
    item.id,
    item.name,
    item.nameKn || '',
    item.enabled,
  ]);
  return item;
};

const saveMetadata = async (db, type, item) => {
  await db.query(`UPDATE ${metadataTableMap[type]} SET name = $2, name_kn = $3, enabled = $4 WHERE id = $1`, [
    item.id,
    item.name,
    item.nameKn || '',
    item.enabled,
  ]);
  return item;
};

const deleteMetadata = (db, type, id) => db.query(`DELETE FROM ${metadataTableMap[type]} WHERE id = $1`, [id]);

// ---------------------------------------------------------------------- sevas

const SEVA_COLUMNS =
  'id, name, name_kn, description, amount, category, availability_status, instructions';

const mapSeva = (row) => ({
  id: row.id,
  name: row.name,
  nameKn: row.name_kn || '',
  description: row.description,
  amount: toNumber(row.amount),
  category: row.category,
  availabilityStatus: row.availability_status,
  instructions: row.instructions,
});

const listSevas = async (db) => {
  const result = await db.query(`SELECT ${SEVA_COLUMNS} FROM sevas ORDER BY name ASC`);
  return result.rows.map(mapSeva);
};

const findSeva = async (db, id, { forUpdate = false } = {}) => {
  const result = await db.query(`SELECT ${SEVA_COLUMNS} FROM sevas WHERE id = $1${lockClause(forUpdate)}`, [id]);
  return result.rows[0] ? mapSeva(result.rows[0]) : null;
};

const findSevasByIds = async (db, ids) => {
  const result = await db.query(`SELECT ${SEVA_COLUMNS} FROM sevas WHERE id = ANY($1::text[]) ORDER BY id`, [ids]);
  return result.rows.map(mapSeva);
};

const sevaValues = (seva) => [
  seva.id,
  seva.name,
  seva.nameKn || '',
  seva.description,
  seva.amount,
  seva.category,
  seva.availabilityStatus,
  seva.instructions,
];

const insertSeva = async (db, seva) => {
  await db.query(`INSERT INTO sevas (${SEVA_COLUMNS}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, sevaValues(seva));
  return seva;
};

const saveSeva = async (db, seva) => {
  await db.query(
    `UPDATE sevas SET name = $2, name_kn = $3, description = $4, amount = $5, category = $6,
       availability_status = $7, instructions = $8 WHERE id = $1`,
    sevaValues(seva),
  );
  return seva;
};

const deleteSeva = (db, id) => db.query('DELETE FROM sevas WHERE id = $1', [id]);

// -------------------------------------------------------------------- devotees

const insertDevotee = async (db, devotee) => {
  await db.query(
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
  return devotee;
};

// -------------------------------------------------------------------- bookings

const BOOKING_COLUMNS = `id, devotee_id, seva_id, devotee_snapshot, booking_date::text AS booking_date,
  booking_time::text AS booking_time, status, payment_mode, payment_reference_number, amount_payable, donation,
  amount_collected, notes, receipt_number, created_at, updated_at, cancellation_reason, cancelled_at, cancelled_by`;

// Extra seva ids of a multi-seva booking live inside the devotee snapshot (`_sevaIds`).
const buildSnapshot = (devotee, sevaIds) => ({ ...devotee, _sevaIds: sevaIds });

const mapBooking = (row) => {
  const { _sevaIds, ...devotee } = row.devotee_snapshot || {};
  const snapshotSevaIds = Array.isArray(_sevaIds) ? [...new Set(_sevaIds.filter(Boolean))] : [];

  return {
    id: row.id,
    devotee,
    devoteeId: row.devotee_id,
    sevaId: row.seva_id,
    sevaIds: snapshotSevaIds.length > 0 ? snapshotSevaIds : row.seva_id ? [row.seva_id] : [],
    bookingDate: row.booking_date,
    bookingTime: typeof row.booking_time === 'string' ? row.booking_time.slice(0, 5) : row.booking_time,
    status: row.status,
    paymentMode: row.payment_mode,
    paymentReferenceNumber: row.payment_reference_number,
    amountPayable: toNumber(row.amount_payable),
    donation: toNumber(row.donation),
    amountCollected: toNumber(row.amount_collected),
    notes: row.notes,
    receiptNumber: row.receipt_number,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    cancellationReason: row.cancellation_reason || '',
    cancelledAt: toIsoString(row.cancelled_at),
    cancelledBy: row.cancelled_by || '',
  };
};

const listBookings = async (db) => {
  const result = await db.query(`SELECT ${BOOKING_COLUMNS} FROM bookings ORDER BY created_at DESC`);
  return result.rows.map(mapBooking);
};

const findBooking = async (db, id, { forUpdate = false } = {}) => {
  const result = await db.query(`SELECT ${BOOKING_COLUMNS} FROM bookings WHERE id = $1${lockClause(forUpdate)}`, [id]);
  return result.rows[0] ? mapBooking(result.rows[0]) : null;
};

const insertBooking = async (db, booking) => {
  await db.query(
    `INSERT INTO bookings (id, devotee_id, seva_id, devotee_snapshot, booking_date, booking_time, status, payment_mode,
       payment_reference_number, amount_payable, donation, amount_collected, notes, receipt_number, created_at, updated_at)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    [
      booking.id,
      booking.devoteeId,
      booking.sevaId,
      JSON.stringify(buildSnapshot(booking.devotee, booking.sevaIds)),
      booking.bookingDate,
      booking.bookingTime,
      booking.status,
      booking.paymentMode,
      booking.paymentReferenceNumber,
      booking.amountPayable,
      booking.donation,
      booking.amountCollected,
      booking.notes,
      booking.receiptNumber,
      booking.createdAt,
      booking.updatedAt,
    ],
  );
  return booking;
};

const saveBooking = async (db, booking) => {
  await db.query(
    `UPDATE bookings SET seva_id = $2, devotee_snapshot = $3::jsonb, booking_date = $4, booking_time = $5, status = $6,
       payment_mode = $7, payment_reference_number = $8, amount_payable = $9, donation = $10, amount_collected = $11,
       notes = $12, updated_at = $13, cancellation_reason = $14, cancelled_at = $15, cancelled_by = $16 WHERE id = $1`,
    [
      booking.id,
      booking.sevaId,
      JSON.stringify(buildSnapshot(booking.devotee, booking.sevaIds)),
      booking.bookingDate,
      booking.bookingTime,
      booking.status,
      booking.paymentMode,
      booking.paymentReferenceNumber,
      booking.amountPayable,
      booking.donation,
      booking.amountCollected,
      booking.notes,
      booking.updatedAt,
      booking.cancellationReason ?? '',
      booking.cancelledAt ?? null,
      booking.cancelledBy ?? '',
    ],
  );
  return booking;
};

// -------------------------------------------------------------- expenditures

const EXPENDITURE_COLUMNS =
  'id, expense_title, expense_category, expense_amount, expense_date::text AS expense_date, payment_mode, vendor_details, notes';

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

const listExpenditures = async (db) => {
  const result = await db.query(`SELECT ${EXPENDITURE_COLUMNS} FROM expenditures ORDER BY expense_date DESC, id DESC`);
  return result.rows.map(mapExpenditure);
};

const findExpenditure = async (db, id, { forUpdate = false } = {}) => {
  const result = await db.query(`SELECT ${EXPENDITURE_COLUMNS} FROM expenditures WHERE id = $1${lockClause(forUpdate)}`, [
    id,
  ]);
  return result.rows[0] ? mapExpenditure(result.rows[0]) : null;
};

const expenditureValues = (item) => [
  item.id,
  item.expenseTitle,
  item.expenseCategory,
  item.expenseAmount,
  item.expenseDate,
  item.paymentMode,
  item.vendorDetails,
  item.notes,
];

const insertExpenditure = async (db, item) => {
  await db.query(
    `INSERT INTO expenditures (id, expense_title, expense_category, expense_amount, expense_date, payment_mode, vendor_details, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    expenditureValues(item),
  );
  return item;
};

const saveExpenditure = async (db, item) => {
  await db.query(
    `UPDATE expenditures SET expense_title = $2, expense_category = $3, expense_amount = $4, expense_date = $5,
       payment_mode = $6, vendor_details = $7, notes = $8 WHERE id = $1`,
    expenditureValues(item),
  );
  return item;
};

const deleteExpenditure = (db, id) => db.query('DELETE FROM expenditures WHERE id = $1', [id]);

// ------------------------------------------------------ notifications & audit

const mapNotification = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  type: row.type,
  createdAt: toIsoString(row.created_at),
});

const listNotifications = async (db, limit = 50) => {
  const result = await db.query(
    'SELECT id, title, description, type, created_at FROM notifications ORDER BY created_at DESC LIMIT $1',
    [limit],
  );
  return result.rows.map(mapNotification);
};

const insertNotification = (db, { title, description, type }) =>
  db.query('INSERT INTO notifications (id, title, description, type, created_at) VALUES ($1, $2, $3, $4, now())', [
    randomUUID(),
    title,
    description,
    type,
  ]);

const mapAuditLog = (row) => ({
  id: row.id,
  action: row.action,
  entity: row.entity,
  actor: row.actor,
  payload: row.payload,
  createdAt: toIsoString(row.created_at),
});

const listAuditLogs = async (db, limit = 20) => {
  const result = await db.query(
    'SELECT id, action, entity, actor, payload, created_at FROM audit_logs ORDER BY created_at DESC LIMIT $1',
    [limit],
  );
  return result.rows.map(mapAuditLog);
};

const insertAuditLog = (db, action, entity, payload, actor = 'system') =>
  db.query(
    'INSERT INTO audit_logs (id, action, entity, actor, payload, created_at) VALUES ($1, $2, $3, $4, $5::jsonb, now())',
    [randomUUID(), action, entity, actor, JSON.stringify(payload ?? {})],
  );

// ------------------------------------------------------------------- dashboard

const getDashboardTotals = async (db, today) => {
  const month = today.slice(0, 7);

  const [todayResult, monthResult, expenseResult, devoteeResult, sevasPerformedResult, popularResult, receiptsResult] = await Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS bookings, COALESCE(SUM(amount_collected), 0) AS collected
       FROM bookings WHERE booking_date = $1::date AND status <> 'cancelled'`,
      [today],
    ),
    db.query(
      `SELECT COALESCE(SUM(amount_collected), 0) AS collected
       FROM bookings WHERE to_char(booking_date, 'YYYY-MM') = $1 AND status <> 'cancelled'`,
      [month],
    ),
    db.query('SELECT COALESCE(SUM(expense_amount), 0) AS total FROM expenditures'),
    db.query('SELECT COUNT(*)::int AS total FROM devotees'),
    db.query(
      `SELECT COALESCE(SUM(
         CASE WHEN jsonb_typeof(devotee_snapshot -> '_sevaIds') = 'array' AND jsonb_array_length(devotee_snapshot -> '_sevaIds') > 0
              THEN jsonb_array_length(devotee_snapshot -> '_sevaIds') ELSE 1 END
       ), 0)::int AS total FROM bookings WHERE status <> 'cancelled'`,
    ),
    db.query(
      `SELECT s.name, s.name_kn, COUNT(b.id)::int AS bookings
       FROM sevas s
       LEFT JOIN bookings b ON b.status <> 'cancelled' AND (b.seva_id = s.id OR jsonb_exists(b.devotee_snapshot -> '_sevaIds', s.id))
       GROUP BY s.id ORDER BY bookings DESC, s.name ASC LIMIT 5`,
    ),
    db.query(
      `SELECT
         COALESCE(SUM(amount) FILTER (WHERE receipt_date = $1::date), 0) AS today,
         COALESCE(SUM(amount) FILTER (WHERE to_char(receipt_date, 'YYYY-MM') = $2), 0) AS month
       FROM receipts WHERE status <> 'cancelled'`,
      [today, month],
    ),
  ]);

  return {
    currentDayBookings: todayResult.rows[0].bookings,
    dailyCollectionAmount: toNumber(todayResult.rows[0].collected) + toNumber(receiptsResult.rows[0].today),
    monthlyCollectionAmount: toNumber(monthResult.rows[0].collected) + toNumber(receiptsResult.rows[0].month),
    totalExpenditures: toNumber(expenseResult.rows[0].total),
    totalDevoteesVisited: devoteeResult.rows[0].total,
    totalSevasPerformed: sevasPerformedResult.rows[0].total,
    popularSevas: popularResult.rows.map((row) => ({ name: row.name, nameKn: row.name_kn || '', bookings: row.bookings })),
  };
};

// -------------------------------------------------------------------- receipts
// Annadana Seva, Donation and Hundi Collection receipts (anything that is not a seva booking).

const RECEIPT_COLUMNS = `id, category, receipt_date::text AS receipt_date, devotee_name, mobile_number, amount, payment_mode,
  payment_reference_number, notes, receipt_number, status, created_by, created_at, updated_at`;

const mapReceipt = (row) => ({
  id: row.id,
  category: row.category,
  receiptDate: row.receipt_date,
  devoteeName: row.devotee_name,
  mobileNumber: row.mobile_number,
  amount: toNumber(row.amount),
  paymentMode: row.payment_mode,
  paymentReferenceNumber: row.payment_reference_number,
  notes: row.notes,
  receiptNumber: row.receipt_number,
  status: row.status,
  createdBy: row.created_by,
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
});

const listReceiptsBetween = async (db, from, to, category = null) => {
  const result = await db.query(
    `SELECT ${RECEIPT_COLUMNS} FROM receipts
     WHERE receipt_date >= $1::date AND receipt_date < $2::date AND ($3::text IS NULL OR category = $3)
     ORDER BY receipt_date DESC, created_at DESC`,
    [from, to, category],
  );
  return result.rows.map(mapReceipt);
};

const findReceipt = async (db, id, { forUpdate = false } = {}) => {
  const result = await db.query(`SELECT ${RECEIPT_COLUMNS} FROM receipts WHERE id = $1${lockClause(forUpdate)}`, [id]);
  return result.rows[0] ? mapReceipt(result.rows[0]) : null;
};

const insertReceipt = async (db, receipt) => {
  await db.query(
    `INSERT INTO receipts (id, category, receipt_date, devotee_name, mobile_number, amount, payment_mode,
       payment_reference_number, notes, receipt_number, status, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      receipt.id,
      receipt.category,
      receipt.receiptDate,
      receipt.devoteeName,
      receipt.mobileNumber,
      receipt.amount,
      receipt.paymentMode,
      receipt.paymentReferenceNumber,
      receipt.notes,
      receipt.receiptNumber,
      receipt.status,
      receipt.createdBy,
      receipt.createdAt,
      receipt.updatedAt,
    ],
  );
  return receipt;
};

const saveReceipt = async (db, receipt) => {
  await db.query(
    `UPDATE receipts SET receipt_date = $2, devotee_name = $3, mobile_number = $4, amount = $5, payment_mode = $6,
       payment_reference_number = $7, notes = $8, status = $9, updated_at = $10 WHERE id = $1`,
    [
      receipt.id,
      receipt.receiptDate,
      receipt.devoteeName,
      receipt.mobileNumber,
      receipt.amount,
      receipt.paymentMode,
      receipt.paymentReferenceNumber,
      receipt.notes,
      receipt.status,
      receipt.updatedAt,
    ],
  );
  return receipt;
};

// --------------------------------------------------------------- blocked dates
// Calendar dates on which no seva bookings are accepted (e.g. Ekadashi).

const mapBlockedDate = (row) => ({
  id: row.id,
  date: row.blocked_date,
  reason: row.reason,
  createdBy: row.created_by,
  createdAt: toIsoString(row.created_at),
  activeBookings: row.active_bookings === undefined ? undefined : Number(row.active_bookings),
});

const BLOCKED_COLUMNS = `d.id, d.blocked_date::text AS blocked_date, d.reason, d.created_by, d.created_at,
  (SELECT COUNT(*) FROM bookings b WHERE b.booking_date = d.blocked_date AND b.status <> 'cancelled') AS active_bookings`;

// from/to are optional (half-open range); without them every blocked date is returned.
const listBlockedDates = async (db, from = null, to = null) => {
  const result = await db.query(
    `SELECT ${BLOCKED_COLUMNS} FROM blocked_dates d
     WHERE ($1::date IS NULL OR d.blocked_date >= $1::date) AND ($2::date IS NULL OR d.blocked_date < $2::date)
     ORDER BY d.blocked_date ASC`,
    [from, to],
  );
  return result.rows.map(mapBlockedDate);
};

const findBlockedDateById = async (db, id) => {
  const result = await db.query(`SELECT ${BLOCKED_COLUMNS} FROM blocked_dates d WHERE d.id = $1`, [id]);
  return result.rows[0] ? mapBlockedDate(result.rows[0]) : null;
};

const findBlockedDate = async (db, date) => {
  const result = await db.query(
    'SELECT id, blocked_date::text AS blocked_date, reason FROM blocked_dates WHERE blocked_date = $1::date',
    [date],
  );
  return result.rows[0] ? { id: result.rows[0].id, date: result.rows[0].blocked_date, reason: result.rows[0].reason } : null;
};

// Returns only the rows that were actually inserted; dates that are already blocked are skipped.
const insertBlockedDates = async (db, entries) => {
  const inserted = [];

  for (const entry of entries) {
    const result = await db.query(
      `INSERT INTO blocked_dates (id, blocked_date, reason, created_by) VALUES ($1, $2::date, $3, $4)
       ON CONFLICT (blocked_date) DO NOTHING RETURNING id`,
      [entry.id, entry.date, entry.reason, entry.createdBy],
    );
    if (result.rowCount > 0) inserted.push(entry.id);
  }

  return inserted;
};

const updateBlockedDateReason = (db, id, reason) => db.query('UPDATE blocked_dates SET reason = $2 WHERE id = $1', [id, reason]);

const deleteBlockedDate = (db, id) => db.query('DELETE FROM blocked_dates WHERE id = $1', [id]);

// --------------------------------------------------------------------- finance

// Half-open date range [from, to) so the date indexes can be used.
const listBookingsBetween = async (db, from, to) => {
  const result = await db.query(
    `SELECT ${BOOKING_COLUMNS} FROM bookings WHERE booking_date >= $1::date AND booking_date < $2::date ORDER BY booking_date DESC, created_at DESC`,
    [from, to],
  );
  return result.rows.map(mapBooking);
};

const listExpendituresBetween = async (db, from, to) => {
  const result = await db.query(
    `SELECT ${EXPENDITURE_COLUMNS} FROM expenditures WHERE expense_date >= $1::date AND expense_date < $2::date ORDER BY expense_date DESC, id DESC`,
    [from, to],
  );
  return result.rows.map(mapExpenditure);
};

const getFinanceSummary = async (db, from, to) => {
  const [debitsResult, categoriesResult, yearsResult] = await Promise.all([
    db.query(
      `SELECT to_char(expense_date, 'YYYY-MM') AS month, COALESCE(SUM(expense_amount), 0) AS amount, COUNT(*)::int AS count
       FROM expenditures WHERE expense_date >= $1::date AND expense_date < $2::date GROUP BY 1`,
      [from, to],
    ),
    db.query(
      `SELECT to_char(expense_date, 'YYYY-MM') AS month, expense_category, COALESCE(SUM(expense_amount), 0) AS amount
       FROM expenditures WHERE expense_date >= $1::date AND expense_date < $2::date GROUP BY 1, 2`,
      [from, to],
    ),
    db.query(
      `SELECT DISTINCT EXTRACT(YEAR FROM d)::int AS year FROM (
         SELECT booking_date AS d FROM bookings UNION SELECT expense_date AS d FROM expenditures
         UNION SELECT receipt_date AS d FROM receipts
       ) dates ORDER BY year DESC`,
    ),
  ]);

  return {
    debits: debitsResult.rows.map((row) => ({ month: row.month, amount: toNumber(row.amount), count: row.count })),
    expenseCategories: categoriesResult.rows.map((row) => ({
      month: row.month,
      category: row.expense_category,
      amount: toNumber(row.amount),
    })),
    years: yearsResult.rows.map((row) => row.year),
  };
};

module.exports = {
  ensureSchema,
  findUserByEmail,
  findUserById,
  listUsers,
  insertUser,
  saveUser,
  setUserPasswordHash,
  countActiveSuperAdmins,
  toPublicUser,
  touchUserLogin,
  isMetadataType,
  listMetadata,
  findMetadata,
  metadataNameExists,
  insertMetadata,
  saveMetadata,
  deleteMetadata,
  listSevas,
  findSeva,
  findSevasByIds,
  insertSeva,
  saveSeva,
  deleteSeva,
  insertDevotee,
  listBookings,
  findBooking,
  insertBooking,
  saveBooking,
  listExpenditures,
  findExpenditure,
  insertExpenditure,
  saveExpenditure,
  deleteExpenditure,
  listNotifications,
  insertNotification,
  listAuditLogs,
  insertAuditLog,
  getDashboardTotals,
  listBlockedDates,
  findBlockedDateById,
  findBlockedDate,
  insertBlockedDates,
  updateBlockedDateReason,
  deleteBlockedDate,
  listReceiptsBetween,
  findReceipt,
  insertReceipt,
  saveReceipt,
  listBookingsBetween,
  listExpendituresBetween,
  getFinanceSummary,
};
