-- A fifth receipt category: Sthala Kanike.
ALTER TABLE receipts DROP CONSTRAINT IF EXISTS receipts_category_check;
ALTER TABLE receipts
  ADD CONSTRAINT receipts_category_check
  CHECK (category IN ('annadana-seva', 'donation', 'hundi-collection', 'sthala-kanike'));
