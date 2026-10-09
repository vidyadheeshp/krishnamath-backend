-- Hindu calendar (panchang) for each day: tithi, nakshatra, masa, festivals, as shown on the booking calendar.
-- Rows are calculated on first use (source 'computed'); a row loaded from the temple's own panchanga is marked
-- 'imported' and is never overwritten by a calculation.
CREATE TABLE IF NOT EXISTS panchang_days (
  panchang_date DATE PRIMARY KEY,
  details JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'computed',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
