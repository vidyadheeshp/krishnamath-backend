-- Optional mobile number on a user's own profile.
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
