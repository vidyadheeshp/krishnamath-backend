-- Dates on which no seva bookings are accepted (Ekadashi and any other day the temple closes bookings).
CREATE TABLE IF NOT EXISTS blocked_dates (
  id TEXT PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
