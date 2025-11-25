# Quick Fix for Admin Login Error

## The Problem
You're getting a 500 error when trying to fetch the profile because:
1. The profile doesn't exist in the database
2. The INSERT policy for profiles is missing

## Solution

### Step 1: Run the Fix SQL Script

Go to Supabase Dashboard → SQL Editor and run `fix-profile-policy.sql`. This will:
- Add the missing INSERT policy so users can create their own profiles
- Create the admin profile for your existing user

**OR** run this SQL directly:

```sql
-- Add INSERT policy for profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create admin profile for existing user
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE LOWER(email) = LOWER('warrenokumu98@gmail.com')
  LIMIT 1;

  IF admin_user_id IS NOT NULL THEN
    INSERT INTO profiles (user_id, email, role)
    VALUES (admin_user_id, 'warrenokumu98@gmail.com', 'admin')
    ON CONFLICT (user_id) DO UPDATE
    SET role = 'admin'
    WHERE LOWER(profiles.email) = LOWER('warrenokumu98@gmail.com');
  END IF;
END $$;
```

### Step 2: Verify the Profile Exists

Run this query to check:

```sql
SELECT p.*, u.email as auth_email
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE LOWER(u.email) = LOWER('warrenokumu98@gmail.com');
```

You should see a row with `role = 'admin'`.

### Step 3: Test Login Again

1. Clear browser cache or use incognito
2. Go to `/login`
3. Login with `warrenokumu98@gmail.com` / `Twenty37`
4. Check console - you should see:
   - "Profile fetched successfully" (not "Profile not found")
   - Redirect to `/admin`

## What Changed in the Code

The app will now automatically create a profile if it doesn't exist when you login. However, you still need the INSERT policy in the database for this to work.

## If It Still Doesn't Work

1. Check Supabase Dashboard → Authentication → Policies
2. Verify the `profiles` table has these policies:
   - "Users can view their own profile" (SELECT)
   - "Users can insert their own profile" (INSERT) ← **This one was missing!**
   - "Users can update their own profile" (UPDATE)
   - "Admins can view all profiles" (SELECT)

3. Check the browser console for detailed error messages
4. Make sure RLS is enabled on the profiles table:
   ```sql
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ```

