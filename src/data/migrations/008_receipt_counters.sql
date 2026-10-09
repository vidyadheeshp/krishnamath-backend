-- One running receipt number per financial year (label like '2627' = April 2026 - March 2027).
-- A new financial year simply has no row yet, so its numbering starts again at 000001.
CREATE TABLE IF NOT EXISTS receipt_counters (
  financial_year TEXT PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);
