-- ============================================
-- Create Admin User in Supabase Auth
-- Note: You cannot directly create users via SQL in Supabase Auth
-- This script will help you verify and create the profile
-- ============================================

-- Step 1: Check if user exists in auth.users
-- Run this to see if the user exists:
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE LOWER(email) = LOWER('warrenokumu98@gmail.com');

-- Step 2: If user exists, create/update their profile
-- This will work if the user was created via signup
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'warrenokumu98@gmail.com';
BEGIN
  -- Find the user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE LOWER(email) = LOWER(admin_email)
  LIMIT 1;

  -- If user exists, ensure profile exists with admin role
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO profiles (user_id, email, role)
    VALUES (admin_user_id, admin_email, 'admin')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      role = 'admin',
      email = admin_email
    WHERE LOWER(profiles.email) = LOWER(admin_email);
    
    RAISE NOTICE 'Profile created/updated for admin user: %', admin_email;
  ELSE
    RAISE NOTICE 'User does not exist in auth.users. Please sign up first at /signup';
  END IF;
END $$;

-- Step 3: Verify the profile was created
SELECT p.*, u.email as auth_email, u.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE LOWER(p.email) = LOWER('warrenokumu98@gmail.com');

