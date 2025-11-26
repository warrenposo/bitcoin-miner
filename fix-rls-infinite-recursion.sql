-- ============================================
-- Fix RLS Infinite Recursion Issue
-- This fixes the "infinite recursion detected in policy" error
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can update all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view all stats" ON mining_stats;
DROP POLICY IF EXISTS "Admins can update all stats" ON mining_stats;
DROP POLICY IF EXISTS "Admins can view all deposits" ON deposits;
DROP POLICY IF EXISTS "Admins can update all deposits" ON deposits;
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can update all withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can view all mining plans" ON mining_plans;
DROP POLICY IF EXISTS "Admins can manage mining plans" ON mining_plans;
DROP POLICY IF EXISTS "Admins can view all user plans" ON user_plans;
DROP POLICY IF EXISTS "Admins can update all user plans" ON user_plans;
DROP POLICY IF EXISTS "Admins can view all referrals" ON referrals;
DROP POLICY IF EXISTS "Admins can view all commissions" ON referral_commissions;
DROP POLICY IF EXISTS "Admins can update all commissions" ON referral_commissions;
DROP POLICY IF EXISTS "Admins can view all wallets" ON user_wallets;
DROP POLICY IF EXISTS "Admins can manage deposit addresses" ON deposit_addresses;

-- Create a security definer function to check if user is admin
-- This function bypasses RLS, preventing infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$;

-- Now recreate all admin policies using the helper function
-- This prevents infinite recursion because the function uses SECURITY DEFINER

-- Profiles policies
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Support tickets policies
CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all tickets"
  ON support_tickets FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Mining stats policies
CREATE POLICY "Admins can view all stats"
  ON mining_stats FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all stats"
  ON mining_stats FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Deposits policies
CREATE POLICY "Admins can view all deposits"
  ON deposits FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all deposits"
  ON deposits FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Withdrawals policies
CREATE POLICY "Admins can view all withdrawals"
  ON withdrawals FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all withdrawals"
  ON withdrawals FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Mining plans policies
CREATE POLICY "Admins can view all mining plans"
  ON mining_plans FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage mining plans"
  ON mining_plans FOR ALL
  USING (public.is_admin(auth.uid()));

-- User plans policies
CREATE POLICY "Admins can view all user plans"
  ON user_plans FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all user plans"
  ON user_plans FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Referrals policies
CREATE POLICY "Admins can view all referrals"
  ON referrals FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Referral commissions policies
CREATE POLICY "Admins can view all commissions"
  ON referral_commissions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all commissions"
  ON referral_commissions FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- User wallets policies
CREATE POLICY "Admins can view all wallets"
  ON user_wallets FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Deposit addresses policies
CREATE POLICY "Admins can manage deposit addresses"
  ON deposit_addresses FOR ALL
  USING (public.is_admin(auth.uid()));

