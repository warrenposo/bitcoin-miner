-- ============================================
-- BTC Mining - Complete Database Schema for Replication
-- Run this in your Supabase SQL Editor
-- Use this to set up a new instance of the project
-- ============================================
-- Before running: Replace 'your-admin@email.com' with your admin email
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT,
  mobile TEXT,
  country_code TEXT DEFAULT '+1',
  country TEXT,
  address TEXT,
  state TEXT,
  zip_code TEXT,
  city TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  referral_code TEXT UNIQUE,
  usdt_wallet_address TEXT,
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- SUPPORT TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- MINING STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mining_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hash_rate DECIMAL(10, 2) DEFAULT 0,
  total_mined DECIMAL(18, 8) DEFAULT 0,
  daily_earnings DECIMAL(18, 8) DEFAULT 0,
  available_balance DECIMAL(18, 8) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- DEPOSITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  gateway TEXT NOT NULL CHECK (gateway IN ('btc', 'usdt-trc20', 'usdt-erc20', 'usdc', 'eth', 'coinbase', 'paypal', 'stripe')),
  amount DECIMAL(18, 2) NOT NULL,
  charge DECIMAL(18, 2) DEFAULT 0,
  payable DECIMAL(18, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  deposit_address TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  conversion_rate DECIMAL(18, 8),
  crypto_amount DECIMAL(18, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- WITHDRAWALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  gateway TEXT NOT NULL CHECK (gateway IN ('btc', 'usdt-trc20', 'usdt-erc20', 'usdc', 'eth')),
  amount DECIMAL(18, 2) NOT NULL,
  wallet_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- MINING PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mining_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('BTC', 'LTC')),
  price DECIMAL(18, 2) NOT NULL,
  duration INTEGER NOT NULL,
  hardware TEXT,
  daily_mining_btc DECIMAL(18, 8),
  daily_mining_ltc DECIMAL(18, 8),
  daily_mining_usd DECIMAL(18, 2),
  monthly_mining_btc DECIMAL(18, 8),
  monthly_mining_ltc DECIMAL(18, 8),
  monthly_mining_usd DECIMAL(18, 2),
  total_mining_btc DECIMAL(18, 8),
  total_mining_ltc DECIMAL(18, 8),
  total_mining_usd DECIMAL(18, 2),
  referral_rewards DECIMAL(18, 2),
  available INTEGER DEFAULT 0,
  sold INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- USER PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES mining_plans(id) ON DELETE RESTRICT NOT NULL,
  plan_name TEXT NOT NULL,
  price DECIMAL(18, 2) NOT NULL,
  currency TEXT NOT NULL,
  return_per_day_min DECIMAL(18, 8),
  return_per_day_max DECIMAL(18, 8),
  total_days INTEGER NOT NULL,
  remaining_days INTEGER NOT NULL,
  fixed_return DECIMAL(18, 8) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'expired')),
  purchased_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- REFERRALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(referred_id)
);

-- ============================================
-- REFERRAL COMMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS referral_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  commission_type TEXT NOT NULL CHECK (commission_type IN ('signup', 'deposit', 'plan_purchase')),
  amount DECIMAL(18, 8) NOT NULL,
  currency TEXT DEFAULT 'USDT',
  percentage DECIMAL(5, 2) NOT NULL,
  related_transaction_id UUID,
  wallet_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- USER WALLETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('BTC', 'USDT', 'USDC', 'ETH', 'LTC')),
  network TEXT,
  address TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, currency, network)
);

-- ============================================
-- DEPOSIT ADDRESSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deposit_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gateway TEXT NOT NULL CHECK (gateway IN ('btc', 'usdt-trc20', 'usdt-erc20', 'usdc', 'eth', 'coinbase', 'paypal', 'stripe')),
  address TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  min_amount DECIMAL(18, 2),
  max_amount DECIMAL(18, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_addresses ENABLE ROW LEVEL SECURITY;

-- Admin check function (avoids RLS recursion)
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

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (public.is_admin(auth.uid()));

-- Support tickets policies
CREATE POLICY "Users can view their own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tickets" ON support_tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tickets" ON support_tickets FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all tickets" ON support_tickets FOR UPDATE USING (public.is_admin(auth.uid()));

-- Mining stats policies
CREATE POLICY "Users can view their own stats" ON mining_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON mining_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all stats" ON mining_stats FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all stats" ON mining_stats FOR UPDATE USING (public.is_admin(auth.uid()));

-- Deposits policies
CREATE POLICY "Users can view their own deposits" ON deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create deposits" ON deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all deposits" ON deposits FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all deposits" ON deposits FOR UPDATE USING (public.is_admin(auth.uid()));

-- Withdrawals policies
CREATE POLICY "Users can view their own withdrawals" ON withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create withdrawals" ON withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all withdrawals" ON withdrawals FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all withdrawals" ON withdrawals FOR UPDATE USING (public.is_admin(auth.uid()));

-- Mining plans policies
CREATE POLICY "Anyone can view active mining plans" ON mining_plans FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can view all mining plans" ON mining_plans FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage mining plans" ON mining_plans FOR ALL USING (public.is_admin(auth.uid()));

-- User plans policies
CREATE POLICY "Users can view their own plans" ON user_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create plans" ON user_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all user plans" ON user_plans FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all user plans" ON user_plans FOR UPDATE USING (public.is_admin(auth.uid()));

-- Referrals policies
CREATE POLICY "Users can view their own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users can create referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referred_id);
CREATE POLICY "Admins can view all referrals" ON referrals FOR SELECT USING (public.is_admin(auth.uid()));

-- Referral commissions policies
CREATE POLICY "Users can view their own commissions" ON referral_commissions FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Admins can view all commissions" ON referral_commissions FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all commissions" ON referral_commissions FOR UPDATE USING (public.is_admin(auth.uid()));

-- User wallets policies
CREATE POLICY "Users can view their own wallets" ON user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own wallets" ON user_wallets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wallets" ON user_wallets FOR SELECT USING (public.is_admin(auth.uid()));

-- Deposit addresses policies
CREATE POLICY "Anyone can view active deposit addresses" ON deposit_addresses FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage deposit addresses" ON deposit_addresses FOR ALL USING (public.is_admin(auth.uid()));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Replace 'your-admin@email.com' with your actual admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_referral_code TEXT;
BEGIN
  user_referral_code := UPPER(SUBSTRING(MD5(COALESCE(NEW.email, '') || NEW.id::text) FROM 1 FOR 8));
  WHILE EXISTS (SELECT 1 FROM profiles WHERE referral_code = user_referral_code) LOOP
    user_referral_code := UPPER(SUBSTRING(MD5(COALESCE(NEW.email, '') || NEW.id::text || random()::text) FROM 1 FOR 8));
  END LOOP;

  INSERT INTO public.profiles (user_id, email, role, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    CASE 
      WHEN LOWER(COALESCE(NEW.email, '')) = LOWER('your-admin@email.com') THEN 'admin'
      ELSE 'user'
    END,
    user_referral_code
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.mining_stats (user_id, hash_rate, total_mined, daily_earnings, available_balance)
  VALUES (NEW.id, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON deposits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mining_plans_updated_at BEFORE UPDATE ON mining_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_plans_updated_at BEFORE UPDATE ON user_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deposit_addresses_updated_at BEFORE UPDATE ON deposit_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_mining_stats_user_id ON mining_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_transaction_id ON deposits(transaction_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_transaction_id ON withdrawals(transaction_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_status ON user_plans(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_referrer_id ON referral_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_status ON referral_commissions(status);
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_addresses_gateway ON deposit_addresses(gateway);

-- ============================================
-- DEPOSIT ADDRESSES (Update with your addresses)
-- ============================================
INSERT INTO deposit_addresses (gateway, address, is_active, min_amount, max_amount) VALUES
  ('btc', 'bc1q8wchmdhvxatty6evk8gjh0cfg262jr0tuwkn9x', TRUE, NULL, NULL),
  ('usdt-trc20', 'TGtTjW3Vso5Rcxx3BGcpQmeq72MMz2MxZ1', TRUE, NULL, NULL),
  ('usdt-erc20', '0x2b5E6d86F7C9b8e64cD753e55a18749f4F268F05', TRUE, NULL, NULL),
  ('usdc', '0x2b5E6d86F7C9b8e64cD753e55a18749f4F268F05', TRUE, NULL, NULL),
  ('eth', '0x2b5E6d86F7C9b8e64cD753e55a18749f4F268F05', TRUE, NULL, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE MINING PLANS (BTC)
-- ============================================
INSERT INTO mining_plans (name, currency, price, duration, hardware, total_mining_btc, total_mining_usd, available, sold, is_active) VALUES
  ('PROMOTIONS', 'BTC', 50, 1, 'Antminer S19', 0.00249, 225.04, 4000, 652, TRUE),
  ('NEW BEGINNER', 'BTC', 70, 7, 'Antminer S19', 0.00720, 650.07, 4000, 652, TRUE),
  ('BASIC', 'BTC', 200, 7, 'Antminer S19', 0.01329, 1200.18, 4000, 452, TRUE),
  ('ECONOMY', 'BTC', 400, 7, 'Antminer S19', 0.01994, 1800.37, 3000, 2154, TRUE),
  ('BRONZE', 'BTC', 1000, 30, 'Antminer S19', 0.0333, 3000, 1000, 0, TRUE),
  ('STANDARD', 'BTC', 2400, 90, 'Antminer S19', NULL, NULL, 2000, 1096, TRUE),
  ('SILVER', 'BTC', 4000, 90, 'Antminer S19', NULL, NULL, 500, 0, TRUE),
  ('SENIOR', 'BTC', 6500, 90, 'Antminer S19', NULL, NULL, 1000, 800, TRUE),
  ('ADVANCED', 'BTC', 12600, 90, 'Antminer S19', NULL, NULL, 800, 461, TRUE),
  ('GOLD', 'BTC', 20000, 365, 'Antminer S19', NULL, NULL, 200, 0, TRUE),
  ('LUXURIOUS', 'BTC', 32000, 365, 'Antminer S19', NULL, NULL, 300, 177, TRUE)
ON CONFLICT DO NOTHING;

-- Update plans with daily/monthly mining
UPDATE mining_plans SET daily_mining_btc = 0.001, daily_mining_usd = 90.07, monthly_mining_btc = 0.03, monthly_mining_usd = 2702.21, referral_rewards = 240 WHERE name = 'STANDARD' AND currency = 'BTC';
UPDATE mining_plans SET daily_mining_btc = 0.0011, daily_mining_usd = 100, monthly_mining_btc = 0.0333, monthly_mining_usd = 3000 WHERE name = 'SILVER' AND currency = 'BTC';
UPDATE mining_plans SET daily_mining_btc = 0.002, daily_mining_usd = 180.15, monthly_mining_btc = 0.06, monthly_mining_usd = 5404.42, referral_rewards = 650 WHERE name = 'SENIOR' AND currency = 'BTC';
UPDATE mining_plans SET daily_mining_btc = 0.015, daily_mining_usd = 1351.10, monthly_mining_btc = 0.45, monthly_mining_usd = 40533.13, referral_rewards = 1260 WHERE name = 'ADVANCED' AND currency = 'BTC';
UPDATE mining_plans SET daily_mining_btc = 0.0185, daily_mining_usd = 1666.67, monthly_mining_btc = 0.555, monthly_mining_usd = 50000 WHERE name = 'GOLD' AND currency = 'BTC';
UPDATE mining_plans SET daily_mining_btc = 0.03, daily_mining_usd = 2702.21, monthly_mining_btc = 0.9, monthly_mining_usd = 81066.27, referral_rewards = 3200 WHERE name = 'LUXURIOUS' AND currency = 'BTC';
UPDATE mining_plans SET referral_rewards = 72.8 WHERE name = 'ECONOMY' AND currency = 'BTC';

-- ============================================
-- SETUP NOTES
-- ============================================
-- 1. Replace 'your-admin@email.com' in handle_new_user() with your admin email
-- 2. Update supabase URL and anon key in src/lib/supabase.ts
-- 3. Add your deposit QR images to src/assets (btc33.jpeg, trc22.jfif, eth11.jpeg)
-- 4. Sign up with admin email to get admin role automatically
