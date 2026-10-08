-- Receipts that are not seva bookings: Annadana Seva, Donation and Hundi Collection.
-- (Seva bookings are accounted under "Religious Seva"; a donation given with a booking is accounted
-- under "Donation".) Cancelled receipts are kept for audit, never deleted.
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('annadana-seva', 'donation', 'hundi-collection')),
  receipt_date DATE NOT NULL,
  devotee_name TEXT NOT NULL DEFAULT '',
  mobile_number TEXT NOT NULL DEFAULT '',
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_mode TEXT NOT NULL,
  payment_reference_number TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  receipt_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS receipts_receipt_date_idx ON receipts (receipt_date);
