-- Run in Supabase SQL Editor: add referral_balance to profiles so admin can edit it per user
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_balance DECIMAL(18, 8) DEFAULT 0;

COMMENT ON COLUMN profiles.referral_balance IS 'Referral earnings balance (editable by admin).';
