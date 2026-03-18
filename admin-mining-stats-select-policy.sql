-- Run this in Supabase SQL Editor if AdminDashboard shows 0 balances
-- Fix: allow admins to SELECT/UPDATE mining_stats (RLS)

-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE mining_stats ENABLE ROW LEVEL SECURITY;

-- Admin can read all mining stats (so admin UI can show balances)
DROP POLICY IF EXISTS "Admins can view all stats" ON mining_stats;
CREATE POLICY "Admins can view all stats" ON mining_stats
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admin can update all mining stats (in case it was missing)
DROP POLICY IF EXISTS "Admins can update all stats" ON mining_stats;
CREATE POLICY "Admins can update all stats" ON mining_stats
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

