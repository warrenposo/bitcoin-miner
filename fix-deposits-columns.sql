-- ============================================
-- Quick Fix: Add Missing Columns to Deposits Table
-- Run this if you get "conversion_rate column does not exist" error
-- ============================================

-- Add missing columns to deposits table if they don't exist
DO $$
BEGIN
  -- Add currency column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'deposits' AND column_name = 'currency'
  ) THEN
    ALTER TABLE deposits ADD COLUMN currency TEXT DEFAULT 'USD';
    UPDATE deposits SET currency = 'USD' WHERE currency IS NULL;
    ALTER TABLE deposits ALTER COLUMN currency SET NOT NULL;
  END IF;

  -- Add conversion_rate column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'deposits' AND column_name = 'conversion_rate'
  ) THEN
    ALTER TABLE deposits ADD COLUMN conversion_rate DECIMAL(18, 8);
  END IF;

  -- Add crypto_amount column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'deposits' AND column_name = 'crypto_amount'
  ) THEN
    ALTER TABLE deposits ADD COLUMN crypto_amount DECIMAL(18, 8);
  END IF;

  -- Update gateway constraint to allow new crypto gateways
  BEGIN
    ALTER TABLE deposits DROP CONSTRAINT IF EXISTS deposits_gateway_check;
    ALTER TABLE deposits ADD CONSTRAINT deposits_gateway_check
      CHECK (gateway IN ('btc', 'usdt-trc20', 'usdt-erc20', 'usdc', 'eth', 'coinbase', 'paypal', 'stripe'));
  EXCEPTION
    WHEN others THEN
      NULL;
  END;
END $$;

