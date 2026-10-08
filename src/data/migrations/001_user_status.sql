-- Allows super admins to deactivate accounts without deleting them (audit history keeps the email).
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));
-- Finance reports group by month; these keep the monthly queries fast as data grows.
CREATE INDEX IF NOT EXISTS bookings_booking_date_idx ON bookings (booking_date);
CREATE INDEX IF NOT EXISTS expenditures_expense_date_idx ON expenditures (expense_date);
