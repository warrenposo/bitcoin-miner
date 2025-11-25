-- ============================================
-- Fix Profile INSERT Policy
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create INSERT policy for profiles
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Also ensure the admin user has a profile
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from auth.users table
-- Or use this to find and update:
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Find the user ID for warrenokumu98@gmail.com
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE LOWER(email) = LOWER('warrenokumu98@gmail.com')
  LIMIT 1;

  -- Create profile if it doesn't exist
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO profiles (user_id, email, role)
    VALUES (admin_user_id, 'warrenokumu98@gmail.com', 'admin')
    ON CONFLICT (user_id) DO UPDATE
    SET role = 'admin'
    WHERE LOWER(profiles.email) = LOWER('warrenokumu98@gmail.com');
  END IF;
END $$;

