-- ============================================
-- Mining sessions & stop balance – run in Supabase SQL Editor
-- 1. Table to store each day's/session's mined amount (pull mined coins from here)
-- 2. Stop balance on profiles: when total_mined >= this, mining stops
-- ============================================

-- Mining sessions: one row per mining session (each "day" of mining)
CREATE TABLE IF NOT EXISTS mining_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  amount_mined DECIMAL(18, 8) DEFAULT 0 NOT NULL,
  target_amount DECIMAL(18, 8) NOT NULL,
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'completed', 'stopped')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE mining_sessions IS 'Each row = one mining session (simulated day). Pull mined coins / history from here.';
COMMENT ON COLUMN mining_sessions.amount_mined IS 'USD amount mined in this session (credited to user when completed).';
COMMENT ON COLUMN mining_sessions.target_amount IS 'Target for this session (e.g. 20% of balance at start).';
COMMENT ON COLUMN mining_sessions.status IS 'running = in progress; completed = day done, amount credited; stopped = hit stop balance.';

-- Stop balance: when user total_mined >= this value, mining stops (NULL = no limit)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mining_stop_balance DECIMAL(18, 8) DEFAULT NULL;

COMMENT ON COLUMN profiles.mining_stop_balance IS 'When total_mined >= this, mining stops. NULL = no limit.';

-- RLS
ALTER TABLE mining_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mining sessions"
  ON mining_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mining sessions"
  ON mining_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mining sessions"
  ON mining_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all mining sessions"
  ON mining_sessions FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Index for pulling mined history by user
CREATE INDEX IF NOT EXISTS idx_mining_sessions_user_id ON mining_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_started_at ON mining_sessions(started_at DESC);
