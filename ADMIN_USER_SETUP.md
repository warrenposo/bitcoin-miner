# Admin User Setup Guide

## The Problem
You're getting "Invalid login credentials" because the user account doesn't exist in Supabase Auth yet.

## Solution: Create the Admin User

You have **two options**:

### Option 1: Sign Up Through the App (Recommended)

1. Go to `/signup` in your app
2. Fill in the form:
   - **Email**: `warrenokumu98@gmail.com`
   - **Password**: `Twenty37`
   - **Full Name**: (optional)
3. Click "Create Account"
4. Check your email for a confirmation link (if email confirmation is enabled)
5. After confirming, run the SQL script below to ensure admin role

### Option 2: Create User via Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" or "Invite User"
3. Enter:
   - **Email**: `warrenokumu98@gmail.com`
   - **Password**: `Twenty37`
   - **Auto Confirm User**: ✅ (check this box)
4. Click "Create User"
5. Run the SQL script below to create the profile with admin role

## After Creating the User

### Step 1: Run the Profile Creation SQL

Go to Supabase Dashboard → SQL Editor and run `create-admin-user.sql`, or run this:

```sql
-- Ensure admin profile exists
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'warrenokumu98@gmail.com';
BEGIN
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE LOWER(email) = LOWER(admin_email)
  LIMIT 1;

  IF admin_user_id IS NOT NULL THEN
    INSERT INTO profiles (user_id, email, role)
    VALUES (admin_user_id, admin_email, 'admin')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      role = 'admin',
      email = admin_email;
    
    RAISE NOTICE 'Admin profile created/updated';
  ELSE
    RAISE NOTICE 'User does not exist. Please create the user first.';
  END IF;
END $$;
```

### Step 2: Verify Everything

Run this query to check:

```sql
SELECT 
  u.id as user_id,
  u.email as auth_email,
  u.email_confirmed_at,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE LOWER(u.email) = LOWER('warrenokumu98@gmail.com');
```

You should see:
- ✅ User exists in `auth.users`
- ✅ Email is confirmed (or `email_confirmed_at` is not null)
- ✅ Profile exists with `role = 'admin'`

### Step 3: Test Login

1. Go to `/login`
2. Enter:
   - **Email**: `warrenokumu98@gmail.com`
   - **Password**: `Twenty37`
3. You should be redirected to `/admin`

## Troubleshooting

### Issue: "Invalid login credentials" still appears

**Possible causes:**
1. User doesn't exist - Create via signup or dashboard
2. Wrong password - Reset password in Supabase Dashboard
3. Email not confirmed - Check email or disable email confirmation

**Fix:**
- Go to Supabase Dashboard → Authentication → Users
- Find the user
- Click "Reset Password" or "Send Confirmation Email"

### Issue: Email confirmation required

If Supabase requires email confirmation:

1. **Option A**: Disable email confirmation (for development)
   - Go to Supabase Dashboard → Authentication → Settings
   - Under "Email Auth", disable "Enable email confirmations"

2. **Option B**: Check your email and click the confirmation link

### Issue: User exists but profile doesn't

Run the `create-admin-user.sql` script to create the profile.

## Quick Checklist

- [ ] User exists in Supabase Auth (`auth.users` table)
- [ ] User email is confirmed (or confirmation is disabled)
- [ ] Profile exists in `profiles` table
- [ ] Profile has `role = 'admin'`
- [ ] INSERT policy exists for profiles table
- [ ] Can login with email/password
- [ ] Redirects to `/admin` after login

