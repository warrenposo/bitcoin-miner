-- ============================================
-- Ensure Admin Role for warrenokumu98@gmail.com
-- Run this in Supabase SQL Editor if admin user already exists
-- ============================================

-- Update existing profile to admin role if email matches (case-insensitive)
UPDATE profiles
SET role = 'admin'
WHERE LOWER(email) = LOWER('warrenokumu98@gmail.com')
AND role != 'admin';

-- Verify the update
SELECT id, email, role, created_at
FROM profiles
WHERE email = 'warrenokumu98@gmail.com';

