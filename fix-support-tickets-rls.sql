-- ============================================
-- Fix Support Tickets RLS Policies
-- Ensures users can view their own tickets
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON support_tickets;

-- Recreate user policies with explicit checks
CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Test query (run this to verify - replace with actual user_id)
-- SELECT * FROM support_tickets WHERE user_id = auth.uid();

