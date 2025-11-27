-- ============================================
-- BTCMining Complete Database Schema
-- Run this in your Supabase SQL Editor
-- This will set up all tables, policies, and functions needed
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (Enhanced)
-- Stores user profile information with role and extended fields
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
-- SUPPORT TICKETS TABLE (Enhanced)
-- Stores customer support tickets with file attachments
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
-- Stores user mining statistics
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
-- Stores deposit transactions
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
-- Stores withdrawal transactions
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
-- Stores available mining plans
-- ============================================
CREATE TABLE IF NOT EXISTS mining_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('BTC', 'LTC')),
  price DECIMAL(18, 2) NOT NULL,
  duration INTEGER NOT NULL, -- in days
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
-- Stores purchased mining plans by users
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
-- Stores referral relationships
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(referred_id) -- A user can only be referred once
);

-- ============================================
-- REFERRAL COMMISSIONS TABLE
-- Stores referral bonus/commission logs
-- ============================================
CREATE TABLE IF NOT EXISTS referral_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  commission_type TEXT NOT NULL CHECK (commission_type IN ('signup', 'deposit', 'plan_purchase')),
  amount DECIMAL(18, 8) NOT NULL,
  currency TEXT DEFAULT 'USDT',
  percentage DECIMAL(5, 2) NOT NULL, -- e.g., 10.00 for 10%
  related_transaction_id UUID, -- Can reference deposit or user_plan
  wallet_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- USER WALLETS TABLE
-- Stores user wallet addresses for different cryptocurrencies
-- ============================================
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('BTC', 'USDT', 'USDC', 'ETH', 'LTC')),
  network TEXT, -- e.g., 'TRC20', 'ERC20'
  address TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, currency, network)
);

-- ============================================
-- DEPOSIT ADDRESSES TABLE
-- Stores deposit addresses for different gateways (demo addresses)
-- ============================================
CREATE TABLE IF NOT EXISTS deposit_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gateway TEXT NOT NULL CHECK (gateway IN ('coinbase', 'paypal', 'stripe', 'btc', 'usdt-trc20', 'usdt-erc20', 'usdc', 'eth')),
  address TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  min_amount DECIMAL(18, 2),
  max_amount DECIMAL(18, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
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

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

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

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Support tickets policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can update all tickets" ON support_tickets;

CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all tickets"
  ON support_tickets FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Mining stats policies
DROP POLICY IF EXISTS "Users can view their own stats" ON mining_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON mining_stats;
DROP POLICY IF EXISTS "Admins can view all stats" ON mining_stats;
DROP POLICY IF EXISTS "Admins can update all stats" ON mining_stats;

CREATE POLICY "Users can view their own stats"
  ON mining_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON mining_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stats"
  ON mining_stats FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all stats"
  ON mining_stats FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Deposits policies
DROP POLICY IF EXISTS "Users can view their own deposits" ON deposits;
DROP POLICY IF EXISTS "Users can create deposits" ON deposits;
DROP POLICY IF EXISTS "Admins can view all deposits" ON deposits;
DROP POLICY IF EXISTS "Admins can update all deposits" ON deposits;

CREATE POLICY "Users can view their own deposits"
  ON deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create deposits"
  ON deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all deposits"
  ON deposits FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all deposits"
  ON deposits FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Withdrawals policies
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can create withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can update all withdrawals" ON withdrawals;

CREATE POLICY "Users can view their own withdrawals"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdrawals"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals"
  ON withdrawals FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all withdrawals"
  ON withdrawals FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Mining plans policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view active mining plans" ON mining_plans;
DROP POLICY IF EXISTS "Admins can view all mining plans" ON mining_plans;
DROP POLICY IF EXISTS "Admins can manage mining plans" ON mining_plans;

CREATE POLICY "Anyone can view active mining plans"
  ON mining_plans FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can view all mining plans"
  ON mining_plans FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage mining plans"
  ON mining_plans FOR ALL
  USING (public.is_admin(auth.uid()));

-- User plans policies
DROP POLICY IF EXISTS "Users can view their own plans" ON user_plans;
DROP POLICY IF EXISTS "Users can create plans" ON user_plans;
DROP POLICY IF EXISTS "Admins can view all user plans" ON user_plans;
DROP POLICY IF EXISTS "Admins can update all user plans" ON user_plans;

CREATE POLICY "Users can view their own plans"
  ON user_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create plans"
  ON user_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all user plans"
  ON user_plans FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all user plans"
  ON user_plans FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Referrals policies
DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON referrals;
DROP POLICY IF EXISTS "Admins can view all referrals" ON referrals;

CREATE POLICY "Users can view their own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

CREATE POLICY "Admins can view all referrals"
  ON referrals FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Referral commissions policies
DROP POLICY IF EXISTS "Users can view their own commissions" ON referral_commissions;
DROP POLICY IF EXISTS "Admins can view all commissions" ON referral_commissions;
DROP POLICY IF EXISTS "Admins can update all commissions" ON referral_commissions;

CREATE POLICY "Users can view their own commissions"
  ON referral_commissions FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can view all commissions"
  ON referral_commissions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all commissions"
  ON referral_commissions FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- User wallets policies
DROP POLICY IF EXISTS "Users can view their own wallets" ON user_wallets;
DROP POLICY IF EXISTS "Users can manage their own wallets" ON user_wallets;
DROP POLICY IF EXISTS "Admins can view all wallets" ON user_wallets;

CREATE POLICY "Users can view their own wallets"
  ON user_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wallets"
  ON user_wallets FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets"
  ON user_wallets FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Deposit addresses policies (public read for active addresses)
DROP POLICY IF EXISTS "Anyone can view active deposit addresses" ON deposit_addresses;
DROP POLICY IF EXISTS "Admins can manage deposit addresses" ON deposit_addresses;

CREATE POLICY "Anyone can view active deposit addresses"
  ON deposit_addresses FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage deposit addresses"
  ON deposit_addresses FOR ALL
  USING (public.is_admin(auth.uid()));

-- ============================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- This ensures compatibility if tables already exist
-- ============================================

-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
  -- Add referral_code if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'referral_code') THEN
    ALTER TABLE profiles ADD COLUMN referral_code TEXT UNIQUE;
  END IF;
  
  -- Add username if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE profiles ADD COLUMN username TEXT;
  END IF;
  
  -- Add mobile if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'mobile') THEN
    ALTER TABLE profiles ADD COLUMN mobile TEXT;
  END IF;
  
  -- Add country_code if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'country_code') THEN
    ALTER TABLE profiles ADD COLUMN country_code TEXT DEFAULT '+1';
  END IF;
  
  -- Add country if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'country') THEN
    ALTER TABLE profiles ADD COLUMN country TEXT;
  END IF;
  
  -- Add address if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'address') THEN
    ALTER TABLE profiles ADD COLUMN address TEXT;
  END IF;
  
  -- Add state if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'state') THEN
    ALTER TABLE profiles ADD COLUMN state TEXT;
  END IF;
  
  -- Add zip_code if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'zip_code') THEN
    ALTER TABLE profiles ADD COLUMN zip_code TEXT;
  END IF;
  
  -- Add city if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'city') THEN
    ALTER TABLE profiles ADD COLUMN city TEXT;
  END IF;
  
  -- Add usdt_wallet_address if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'usdt_wallet_address') THEN
    ALTER TABLE profiles ADD COLUMN usdt_wallet_address TEXT;
  END IF;
  
  -- Add two_fa_enabled if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'two_fa_enabled') THEN
    ALTER TABLE profiles ADD COLUMN two_fa_enabled BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add two_fa_secret if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'two_fa_secret') THEN
    ALTER TABLE profiles ADD COLUMN two_fa_secret TEXT;
  END IF;
END $$;

-- Add missing columns to support_tickets if they don't exist
DO $$ 
BEGIN
  -- Add name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'support_tickets' AND column_name = 'name') THEN
    ALTER TABLE support_tickets ADD COLUMN name TEXT;
    -- Update existing rows to have a default name
    UPDATE support_tickets SET name = 'User' WHERE name IS NULL;
    ALTER TABLE support_tickets ALTER COLUMN name SET NOT NULL;
  END IF;
  
  -- Add email if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'support_tickets' AND column_name = 'email') THEN
    ALTER TABLE support_tickets ADD COLUMN email TEXT;
    -- Update existing rows to have email from profile
    UPDATE support_tickets st 
    SET email = p.email 
    FROM profiles p 
    WHERE st.user_id = p.user_id AND st.email IS NULL;
    ALTER TABLE support_tickets ALTER COLUMN email SET NOT NULL;
  END IF;
  
  -- Add file_url if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'support_tickets' AND column_name = 'file_url') THEN
    ALTER TABLE support_tickets ADD COLUMN file_url TEXT;
  END IF;
  
  -- Add file_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'support_tickets' AND column_name = 'file_name') THEN
    ALTER TABLE support_tickets ADD COLUMN file_name TEXT;
  END IF;
END $$;

-- Add missing columns to mining_stats if they don't exist
DO $$ 
BEGIN
  -- Add available_balance if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'mining_stats' AND column_name = 'available_balance') THEN
    ALTER TABLE mining_stats ADD COLUMN available_balance DECIMAL(18, 8) DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_referral_code TEXT;
BEGIN
  -- Generate unique referral code
  user_referral_code := UPPER(SUBSTRING(MD5(NEW.email || NEW.id::text) FROM 1 FOR 8));
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM profiles WHERE referral_code = user_referral_code) LOOP
    user_referral_code := UPPER(SUBSTRING(MD5(NEW.email || NEW.id::text || random()::text) FROM 1 FOR 8));
  END LOOP;
  
  -- Create profile with admin role for specific email
  INSERT INTO public.profiles (user_id, email, role, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN LOWER(NEW.email) = LOWER('warrenokumu98@gmail.com') THEN 'admin'
      ELSE 'user'
    END,
    user_referral_code
  );
  
  -- Create initial mining stats
  INSERT INTO public.mining_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
DROP TRIGGER IF EXISTS update_deposits_updated_at ON deposits;
DROP TRIGGER IF EXISTS update_withdrawals_updated_at ON withdrawals;
DROP TRIGGER IF EXISTS update_mining_plans_updated_at ON mining_plans;
DROP TRIGGER IF EXISTS update_user_plans_updated_at ON user_plans;
DROP TRIGGER IF EXISTS update_user_wallets_updated_at ON user_wallets;
DROP TRIGGER IF EXISTS update_deposit_addresses_updated_at ON deposit_addresses;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at
  BEFORE UPDATE ON deposits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mining_plans_updated_at
  BEFORE UPDATE ON mining_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON user_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_wallets_updated_at
  BEFORE UPDATE ON user_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deposit_addresses_updated_at
  BEFORE UPDATE ON deposit_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INDEXES for better performance
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
-- INSERT DEMO DEPOSIT ADDRESSES
-- ============================================
INSERT INTO deposit_addresses (gateway, address, is_active, min_amount, max_amount) VALUES
  ('coinbase', 'demo-coinbase-address-123456789', TRUE, 10, 100000),
  ('paypal', 'demo-paypal-address-123456789', TRUE, 50, 50000),
  ('stripe', 'demo-stripe-address-123456789', TRUE, 10, 100000),
  ('btc', '163JAZy3CEz8YoNGDDtu9KxpXgnm5Kn9Rs', TRUE, NULL, NULL),
  ('usdt-trc20', 'THaAnBqAvQ3YY751nXqNDzCoczYVQtBKnP', TRUE, NULL, NULL),
  ('usdt-erc20', '0x8c0fd3fdc6f56e658fb1bffa8f5ddd65388ba690', TRUE, NULL, NULL),
  ('usdc', '0x8c0fd3fdc6f56e658fb1bffa8f5ddd65388ba690', TRUE, NULL, NULL),
  ('eth', '0x8c0fd3fdc6f56e658fb1bffa8f5ddd65388ba690', TRUE, NULL, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT SAMPLE MINING PLANS (BTC)
-- ============================================
INSERT INTO mining_plans (name, currency, price, duration, hardware, total_mining_btc, total_mining_usd, available, sold, is_active) VALUES
  ('PROMOTIONS', 'BTC', 50, 1, 'Antminer S19', 0.00190, 225.00, 4000, 652, TRUE),
  ('NEW BEGINNER', 'BTC', 70, 1, 'Antminer S19', 0.001347, 350.00, 4000, 652, TRUE),
  ('BASIC', 'BTC', 200, 1, 'Antminer S19', 0.008938, 650.30, 4000, 452, TRUE),
  ('ECONOMY', 'BTC', 400, 2, 'Antminer S19', 0.030351, 1200.00, 3000, 2154, TRUE),
  ('STANDART', 'BTC', 2400, 365, 'Antminer S19', NULL, NULL, 2000, 1096, TRUE),
  ('SENIOR', 'BTC', 6500, 365, 'Antminer S19', NULL, NULL, 1000, 800, TRUE),
  ('ADVANCED', 'BTC', 12600, 365, 'Antminer S19', NULL, NULL, 800, 461, TRUE),
  ('LUXURIOUS', 'BTC', 32000, 365, 'Antminer S19', NULL, NULL, 300, 177, TRUE),
  ('Vip 1', 'BTC', 72000, 365, 'Antminer S19', NULL, NULL, 300, 174, TRUE),
  ('VIP3', 'BTC', 169800, 365, 'Antminer S19', NULL, NULL, 300, 278, TRUE)
ON CONFLICT DO NOTHING;

-- Update STANDART and above plans with daily/monthly mining
UPDATE mining_plans SET 
  daily_mining_btc = 0.003734,
  daily_mining_usd = 407.50,
  monthly_mining_btc = 0.112030,
  monthly_mining_usd = 12225.00,
  referral_rewards = 240
WHERE name = 'STANDART' AND currency = 'BTC';

UPDATE mining_plans SET 
  daily_mining_btc = 0.015652,
  daily_mining_usd = 1708.00,
  monthly_mining_btc = 0.469563,
  monthly_mining_usd = 51240.00,
  referral_rewards = 650
WHERE name = 'SENIOR' AND currency = 'BTC';

UPDATE mining_plans SET 
  daily_mining_btc = 0.042764,
  daily_mining_usd = 4666.50,
  monthly_mining_btc = 1.282913,
  monthly_mining_usd = 139995.00,
  referral_rewards = 1260
WHERE name = 'ADVANCED' AND currency = 'BTC';

UPDATE mining_plans SET 
  daily_mining_btc = 0.119498,
  daily_mining_usd = 13040.00,
  monthly_mining_btc = 3.584953,
  monthly_mining_usd = 391200.00,
  referral_rewards = 3200
WHERE name = 'LUXURIOUS' AND currency = 'BTC';

UPDATE mining_plans SET 
  daily_mining_btc = 0.445645,
  daily_mining_usd = 48630.00,
  monthly_mining_btc = 13.3693,
  monthly_mining_usd = 1458900.00,
  referral_rewards = 7200
WHERE name = 'Vip 1' AND currency = 'BTC';

UPDATE mining_plans SET 
  daily_mining_btc = 0.995393,
  daily_mining_usd = 108620.00,
  monthly_mining_btc = 29.8618,
  monthly_mining_usd = 3258600.00,
  referral_rewards = 16980
WHERE name = 'VIP3' AND currency = 'BTC';

UPDATE mining_plans SET referral_rewards = 72.8 WHERE name = 'ECONOMY' AND currency = 'BTC';

-- ============================================
-- INSERT SAMPLE MINING PLANS (LTC)
-- ============================================
INSERT INTO mining_plans (name, currency, price, duration, hardware, daily_mining_ltc, daily_mining_usd, monthly_mining_ltc, monthly_mining_usd, available, sold, is_active) VALUES
  ('Activity Award', 'LTC', 200, 365, 'Antminer L3+', 0.076033, 6.70, 2.280997, 201.00, 5000, 1977, TRUE),
  ('BASIC', 'LTC', 1000, 365, 'Antminer L3+', 0.465278, 41.00, 13.958343, 1230.00, 3000, 2817, TRUE),
  ('STANDART', 'LTC', 3000, 365, 'Antminer L3+', 2.360435, 208.00, 70.813056, 6240.00, 1000, 971, TRUE),
  ('LUXURIOUS', 'LTC', 15000, 365, 'Antminer L3+', 18.384159, 1620.00, 551.524765, 48600.00, 500, 470, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTES FOR ADMIN SETUP
-- ============================================
-- 1. The admin user (warrenokumu98@gmail.com) will automatically get 'admin' role when they sign up
-- 2. Password: Twenty37
-- 3. If the admin user already exists, you can manually update their role:
--    UPDATE profiles SET role = 'admin' WHERE email = 'warrenokumu98@gmail.com';
-- 4. All deposit addresses are set to demo addresses - update them later with real addresses
-- 5. Mining plans are pre-populated with sample data
-- 6. All RLS policies are set up to ensure proper access control

