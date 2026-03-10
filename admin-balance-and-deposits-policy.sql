-- Run this in Supabase SQL Editor to allow admin balance management and deposit log reflection
-- 1. Allow admins to INSERT into mining_stats (when user has no row, admin creates one)
-- 2. Allow admins to create deposit records (so admin credits show in user's Deposit Log)
-- 3. Allow admins to create referral_commission records (so referral bonus can be recorded when admin credits a user)

-- Mining stats: allow admins to insert (so balance update works when user has no mining_stats row yet)
DROP POLICY IF EXISTS "Admins can insert mining stats" ON mining_stats;
CREATE POLICY "Admins can insert mining stats" ON mining_stats
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Deposits: allow admins to insert (for balance adjustments that appear as deposits)
DROP POLICY IF EXISTS "Admins can create deposits" ON deposits;
CREATE POLICY "Admins can create deposits" ON deposits
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Referral commissions: allow admins to insert (for recording referral bonus on admin adjustments)
DROP POLICY IF EXISTS "Admins can create commissions" ON referral_commissions;
CREATE POLICY "Admins can create commissions" ON referral_commissions
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));
