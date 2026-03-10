-- Run in Supabase SQL Editor: add Solana as a payment/deposit gateway
-- 1. Allow 'solana' in deposits, deposit_addresses, and withdrawals gateway checks
-- 2. Insert your Solana address into deposit_addresses

-- Withdrawals table: add 'solana' to gateway CHECK
ALTER TABLE withdrawals DROP CONSTRAINT IF EXISTS withdrawals_gateway_check;
ALTER TABLE withdrawals ADD CONSTRAINT withdrawals_gateway_check
  CHECK (gateway IN ('btc', 'usdt-trc20', 'usdt-erc20', 'usdc', 'eth', 'solana'));

-- Deposits table: add 'solana' to gateway CHECK
ALTER TABLE deposits DROP CONSTRAINT IF EXISTS deposits_gateway_check;
ALTER TABLE deposits ADD CONSTRAINT deposits_gateway_check
  CHECK (gateway IN ('btc', 'usdt-trc20', 'usdt-erc20', 'usdc', 'eth', 'coinbase', 'paypal', 'stripe', 'solana'));

-- Deposit_addresses table: add 'solana' to gateway CHECK
ALTER TABLE deposit_addresses DROP CONSTRAINT IF EXISTS deposit_addresses_gateway_check;
ALTER TABLE deposit_addresses ADD CONSTRAINT deposit_addresses_gateway_check
  CHECK (gateway IN ('btc', 'usdt-trc20', 'usdt-erc20', 'usdc', 'eth', 'coinbase', 'paypal', 'stripe', 'solana'));

-- Insert your Solana deposit address (only if not already present)
INSERT INTO deposit_addresses (gateway, address, is_active, min_amount, max_amount)
SELECT 'solana', 'D26bc2Rh5Ebz5vMxb8dkHKMLJB6YRy4GGapKJWiiqgwc', TRUE, 70, 500000
WHERE NOT EXISTS (SELECT 1 FROM deposit_addresses WHERE gateway = 'solana' LIMIT 1);
