-- PostgreSQL import for Krishnamath
-- Import this file in pgAdmin against the target database.

BEGIN;

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS expenditures CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS sevas CASCADE;
DROP TABLE IF EXISTS devotees CASCADE;
DROP TABLE IF EXISTS metadata_seva_categories CASCADE;
DROP TABLE IF EXISTS metadata_event_types CASCADE;
DROP TABLE IF EXISTS metadata_payment_modes CASCADE;
DROP TABLE IF EXISTS metadata_raashis CASCADE;
DROP TABLE IF EXISTS metadata_nakshatras CASCADE;
DROP TABLE IF EXISTS metadata_gotras CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  last_login_at TIMESTAMPTZ NULL
);

CREATE TABLE metadata_gotras (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_kn TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE metadata_nakshatras (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_kn TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE metadata_raashis (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_kn TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE metadata_payment_modes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_kn TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE metadata_event_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_kn TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE metadata_seva_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_kn TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE devotees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  gotra TEXT NOT NULL DEFAULT '',
  nakshatra TEXT NOT NULL DEFAULT '',
  raashi TEXT NOT NULL DEFAULT ''
);

CREATE TABLE sevas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_kn TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  max_bookings_per_day INTEGER NOT NULL DEFAULT 0,
  availability_status TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT ''
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  devotee_id TEXT NOT NULL REFERENCES devotees(id),
  seva_id TEXT NOT NULL REFERENCES sevas(id),
  devotee_snapshot JSONB NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT NOT NULL,
  payment_mode TEXT NOT NULL,
  payment_reference_number TEXT NOT NULL DEFAULT '',
  amount_payable NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount_collected NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  receipt_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE expenditures (
  id TEXT PRIMARY KEY,
  expense_title TEXT NOT NULL,
  expense_category TEXT NOT NULL,
  expense_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL,
  payment_mode TEXT NOT NULL,
  vendor_details TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  actor TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

INSERT INTO users (id, name, email, role, password_hash, last_login_at) VALUES
  ('c5c1a59d-470b-4696-b7a3-715e34040dec', 'Temple Admin', 'admin@temple.local', 'admin', '$2b$10$vgoiVO87WTcAuAhmeUXMs.fVZV7OL.9N0.7ptRRFAt3HrHOTjlT0O', '2026-05-07T15:32:26.471Z');

INSERT INTO metadata_gotras (id, name, name_kn, enabled) VALUES
  ('c6414be9-b37e-4f47-9c76-11783e2082ef', 'Bharadwaja', 'ಭರದ್ವಾಜ', TRUE),
  ('5308f4b7-5dbf-441e-950f-a1ca537eee2d', 'Kashyapa', 'ಕಶ್ಯಪ', TRUE);

INSERT INTO metadata_nakshatras (id, name, name_kn, enabled) VALUES
  ('75e9f860-3f56-40fa-a90d-3ae4ad67128c', 'Ashwini', 'ಅಶ್ವಿನಿ', TRUE),
  ('50a8926b-3b26-485c-bfdf-ee7c0138666b', 'Rohini', 'ರೋಹಿಣಿ', TRUE);

INSERT INTO metadata_raashis (id, name, name_kn, enabled) VALUES
  ('9524c694-7cb3-4049-81e3-834bcef7c2d6', 'Mesha', 'ಮೇಷ', TRUE),
  ('dc9ac8b1-2106-40d4-a013-d3bd80418cda', 'Vrishabha', 'ವೃಷಭ', TRUE);

INSERT INTO metadata_payment_modes (id, name, name_kn, enabled) VALUES
  ('ebf39d5f-f5fe-4cbc-9a3e-59e5ffd11345', 'Cash', 'ನಗದು', TRUE),
  ('cd5756f2-42ee-4bfb-afca-b60ec12dd6c7', 'UPI', 'ಯುಪಿಐ', TRUE),
  ('32018d14-dd76-4176-b8c0-1f72d7f19b0f', 'Card', 'ಕಾರ್ಡ್', TRUE);

INSERT INTO metadata_event_types (id, name, name_kn, enabled) VALUES
  ('ad9280f9-0743-4546-b4f7-3dc0e4495bb8', 'Festival', 'ಹಬ್ಬ', TRUE),
  ('9a75cd4f-efdd-488b-94d7-e831d2a3df69', 'Special Pooja', 'ವಿಶೇಷ ಪೂಜೆ', TRUE);

INSERT INTO metadata_seva_categories (id, name, name_kn, enabled) VALUES
  ('0f91088f-1cf7-4c58-9bf8-3a970b381346', 'Daily', 'ದೈನಂದಿನ', TRUE),
  ('a8c3c7fe-e6b3-4f76-88c1-b6ff2d46048f', 'Special', 'ವಿಶೇಷ', TRUE);

INSERT INTO devotees (id, name, mobile_number, address, gotra, nakshatra, raashi) VALUES
  ('5e8beb16-b1ff-4188-af03-0421150c4710', 'Demo Devotee', '9876543210', '', 'Bharadwaja', 'Ashwini', 'Mesha');

INSERT INTO sevas (id, name, name_kn, description, amount, duration, category, max_bookings_per_day, availability_status, instructions) VALUES
  ('42acdbf8-c507-4827-ab23-c28ae39710fe', 'Archana', 'ಅರ್ಚನೆ', 'Daily archana seva for devotees.', 250, 30, 'Daily', 20, 'active', 'Please arrive 10 minutes early.'),
  ('f8e52806-d0e2-4a3f-a1b9-8c3778a4284c', 'Abhisheka', 'ಅಭಿಷೇಕ', 'Special abhisheka seva for auspicious days.', 1000, 60, 'Special', 8, 'active', 'Traditional attire recommended.');

INSERT INTO bookings (
  id,
  devotee_id,
  seva_id,
  devotee_snapshot,
  booking_date,
  booking_time,
  status,
  payment_mode,
  payment_reference_number,
  amount_payable,
  discount,
  amount_collected,
  notes,
  receipt_number,
  created_at,
  updated_at
) VALUES (
  '5dd16b64-2836-4725-b08f-538791238151',
  '5e8beb16-b1ff-4188-af03-0421150c4710',
  '42acdbf8-c507-4827-ab23-c28ae39710fe',
  '{"id":"5e8beb16-b1ff-4188-af03-0421150c4710","name":"Demo Devotee","mobileNumber":"9876543210","address":"","gotra":"Bharadwaja","nakshatra":"Ashwini","raashi":"Mesha"}'::jsonb,
  '2026-05-07',
  '09:00:00',
  'confirmed',
  'Cash',
  '',
  250,
  0,
  250,
  'Validation booking',
  'TS-2026-7B2C1A37',
  '2026-05-07T15:24:55.708Z',
  '2026-05-07T15:24:55.708Z'
);

INSERT INTO notifications (id, title, description, type, created_at) VALUES
  ('71e1c49e-4ee9-49d2-9cbc-970a32138756', 'Booking confirmed', 'Demo Devotee booked Archana', 'booking', '2026-05-07T15:24:55.709Z'),
  ('ebec0376-7355-4fb8-8768-c023b39e2b2f', 'System ready', 'Temple booking platform initialized successfully.', 'system', '2026-05-07T15:15:35.655Z');

INSERT INTO audit_logs (id, action, entity, actor, payload, created_at) VALUES
  (
    '0d8c83c4-d998-4c4c-b7d7-a52609d75cad',
    'LOGIN',
    'user',
    'admin@temple.local',
    '{"userId":"c5c1a59d-470b-4696-b7a3-715e34040dec"}'::jsonb,
    '2026-05-07T15:32:26.471Z'
  ),
  (
    '9826b444-b0b4-4719-a4f6-9338f3314a31',
    'CREATE',
    'booking',
    'admin@temple.local',
    '{"id":"5dd16b64-2836-4725-b08f-538791238151","devotee":{"id":"5e8beb16-b1ff-4188-af03-0421150c4710","name":"Demo Devotee","mobileNumber":"9876543210","address":"","gotra":"Bharadwaja","nakshatra":"Ashwini","raashi":"Mesha"},"devoteeId":"5e8beb16-b1ff-4188-af03-0421150c4710","sevaId":"42acdbf8-c507-4827-ab23-c28ae39710fe","bookingDate":"2026-05-07","bookingTime":"09:00","status":"confirmed","paymentMode":"Cash","paymentReferenceNumber":"","amountPayable":250,"discount":0,"amountCollected":250,"notes":"Validation booking","receiptNumber":"TS-2026-7B2C1A37","createdAt":"2026-05-07T15:24:55.708Z","updatedAt":"2026-05-07T15:24:55.708Z"}'::jsonb,
    '2026-05-07T15:24:55.709Z'
  ),
  (
    'ade1fc46-4dcd-4c6a-b53b-f7a99fa98bd4',
    'LOGIN',
    'user',
    'admin@temple.local',
    '{"userId":"c5c1a59d-470b-4696-b7a3-715e34040dec"}'::jsonb,
    '2026-05-07T15:24:55.672Z'
  ),
  (
    'bfd302c9-bede-47dc-86fb-43b329e8cd16',
    'LOGIN',
    'user',
    'admin@temple.local',
    '{"userId":"c5c1a59d-470b-4696-b7a3-715e34040dec"}'::jsonb,
    '2026-05-07T15:16:47.268Z'
  );

COMMIT;