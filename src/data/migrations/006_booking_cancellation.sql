-- Why, when and by whom a booking was cancelled. Older cancelled bookings simply have no reason recorded.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by TEXT NOT NULL DEFAULT '';
