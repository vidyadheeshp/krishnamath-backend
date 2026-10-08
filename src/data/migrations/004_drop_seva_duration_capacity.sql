-- A seva no longer has a duration (minutes) or a daily booking capacity.
ALTER TABLE sevas DROP COLUMN IF EXISTS duration;
ALTER TABLE sevas DROP COLUMN IF EXISTS max_bookings_per_day;
