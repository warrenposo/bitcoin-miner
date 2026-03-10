-- Per-user mining on/off: admins enable or disable mining per user from User Directory.
-- Users see "Mining session is not activated" and contact support when their mining is disabled.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mining_enabled BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN profiles.mining_enabled IS 'When false, this user cannot start mining; they see a message to contact support.';
