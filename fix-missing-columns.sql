-- ============================================
-- Quick Fix: Add Missing Columns
-- Run this if you get "column does not exist" errors
-- ============================================

-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
  -- Add referral_code if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'referral_code') THEN
    ALTER TABLE profiles ADD COLUMN referral_code TEXT;
    -- Add unique constraint if it doesn't exist
    CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code_unique ON profiles(referral_code) WHERE referral_code IS NOT NULL;
  END IF;
  
  -- Add username if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE profiles ADD COLUMN username TEXT;
  END IF;
  
  -- Add mobile if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'mobile') THEN
    ALTER TABLE profiles ADD COLUMN mobile TEXT;
  END IF;
  
  -- Add country_code if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'country_code') THEN
    ALTER TABLE profiles ADD COLUMN country_code TEXT DEFAULT '+1';
  END IF;
  
  -- Add country if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'country') THEN
    ALTER TABLE profiles ADD COLUMN country TEXT;
  END IF;
  
  -- Add address if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'address') THEN
    ALTER TABLE profiles ADD COLUMN address TEXT;
  END IF;
  
  -- Add state if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'state') THEN
    ALTER TABLE profiles ADD COLUMN state TEXT;
  END IF;
  
  -- Add zip_code if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'zip_code') THEN
    ALTER TABLE profiles ADD COLUMN zip_code TEXT;
  END IF;
  
  -- Add city if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'city') THEN
    ALTER TABLE profiles ADD COLUMN city TEXT;
  END IF;
  
  -- Add usdt_wallet_address if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'usdt_wallet_address') THEN
    ALTER TABLE profiles ADD COLUMN usdt_wallet_address TEXT;
  END IF;
  
  -- Add two_fa_enabled if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'two_fa_enabled') THEN
    ALTER TABLE profiles ADD COLUMN two_fa_enabled BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add two_fa_secret if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'two_fa_secret') THEN
    ALTER TABLE profiles ADD COLUMN two_fa_secret TEXT;
  END IF;
END $$;

-- Add missing columns to support_tickets if they don't exist
DO $$ 
BEGIN
  -- Add name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'support_tickets' AND column_name = 'name') THEN
    ALTER TABLE support_tickets ADD COLUMN name TEXT;
    -- Update existing rows to have a default name
    UPDATE support_tickets SET name = 'User' WHERE name IS NULL;
    -- Make it NOT NULL after updating
    ALTER TABLE support_tickets ALTER COLUMN name SET NOT NULL;
  END IF;
  
  -- Add email if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'support_tickets' AND column_name = 'email') THEN
    ALTER TABLE support_tickets ADD COLUMN email TEXT;
    -- Update existing rows to have email from profile
    UPDATE support_tickets st 
    SET email = p.email 
    FROM profiles p 
    WHERE st.user_id = p.user_id AND st.email IS NULL;
    -- Make it NOT NULL after updating
    ALTER TABLE support_tickets ALTER COLUMN email SET NOT NULL;
  END IF;
  
  -- Add file_url if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'support_tickets' AND column_name = 'file_url') THEN
    ALTER TABLE support_tickets ADD COLUMN file_url TEXT;
  END IF;
  
  -- Add file_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'support_tickets' AND column_name = 'file_name') THEN
    ALTER TABLE support_tickets ADD COLUMN file_name TEXT;
  END IF;
END $$;

-- Add missing columns to mining_stats if they don't exist
DO $$ 
BEGIN
  -- Add available_balance if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'mining_stats' AND column_name = 'available_balance') THEN
    ALTER TABLE mining_stats ADD COLUMN available_balance DECIMAL(18, 8) DEFAULT 0;
  END IF;
END $$;

-- Ensure deposits table has crypto payment metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'deposits' AND column_name = 'currency'
  ) THEN
    ALTER TABLE deposits ADD COLUMN currency TEXT DEFAULT 'USD';
    UPDATE deposits SET currency = 'USD' WHERE currency IS NULL;
    ALTER TABLE deposits ALTER COLUMN currency SET NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'deposits' AND column_name = 'conversion_rate'
  ) THEN
    ALTER TABLE deposits ADD COLUMN conversion_rate DECIMAL(18, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'deposits' AND column_name = 'crypto_amount'
  ) THEN
    ALTER TABLE deposits ADD COLUMN crypto_amount DECIMAL(18, 8);
  END IF;

  -- Refresh gateway constraint to allow the new crypto rails
  BEGIN
    ALTER TABLE deposits DROP CONSTRAINT IF EXISTS deposits_gateway_check;
    ALTER TABLE deposits ADD CONSTRAINT deposits_gateway_check
      CHECK (gateway IN ('btc', 'usdt-trc20', 'usdt-erc20', 'usdc', 'eth', 'coinbase', 'paypal', 'stripe'));
  EXCEPTION
    WHEN others THEN
      -- Constraint might not exist yet; ignore errors
      NULL;
  END;
END $$;

-- Generate referral codes for existing users who don't have one
UPDATE profiles 
SET referral_code = UPPER(SUBSTRING(MD5(email || user_id::text) FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- Ensure uniqueness of referral codes
DO $$
DECLARE
  rec RECORD;
  new_code TEXT;
BEGIN
  FOR rec IN SELECT user_id, email FROM profiles WHERE referral_code IS NULL OR referral_code IN (
    SELECT referral_code FROM profiles GROUP BY referral_code HAVING COUNT(*) > 1
  ) LOOP
    LOOP
      new_code := UPPER(SUBSTRING(MD5(rec.email || rec.user_id::text || random()::text) FROM 1 FOR 8));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = new_code);
    END LOOP;
    UPDATE profiles SET referral_code = new_code WHERE user_id = rec.user_id;
  END LOOP;
END $$;

