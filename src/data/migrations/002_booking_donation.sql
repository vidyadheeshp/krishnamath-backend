-- A booking's optional extra amount is now a donation added on top of the seva amount
-- (amount_collected = amount_payable + donation) instead of a discount subtracted from it.
-- Legacy rows that carried a discount keep their collected amount: the payable amount becomes
-- what was actually collected and the donation starts at zero, so finance totals do not change.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'discount'
  ) THEN
    UPDATE bookings SET amount_payable = amount_collected, discount = 0 WHERE discount > 0;
    ALTER TABLE bookings RENAME COLUMN discount TO donation;
  END IF;
END $$;
