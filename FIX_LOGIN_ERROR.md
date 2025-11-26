# Fix for Login Error - Infinite Recursion in RLS Policies

## Problem
The login was failing with error: **"infinite recursion detected in policy for relation 'profiles'"**

This happened because admin RLS policies were querying the `profiles` table to check if a user is an admin, which triggered the same policy check again, creating an infinite loop.

## Solution
Created a `SECURITY DEFINER` function `is_admin()` that bypasses RLS when checking admin status. All admin policies now use this function instead of directly querying profiles.

## Files to Run (In Order)

### Step 1: Fix Missing Columns
Run `fix-missing-columns.sql` first to add any missing columns:
- Adds `referral_code` and other missing columns to profiles table
- Generates referral codes for existing users

### Step 2: Fix RLS Infinite Recursion
Run `fix-rls-infinite-recursion.sql` to fix the login issue:
- Creates the `is_admin()` helper function
- Replaces all recursive admin policies with non-recursive ones

### Step 3: (Optional) Full Schema
If you want to ensure everything is set up correctly, run `complete-database-schema.sql`:
- This includes all the fixes above
- Sets up all tables, policies, triggers, and sample data

## Quick Fix (Recommended)

If you just want to fix the login issue immediately:

1. Open Supabase SQL Editor
2. Run `fix-rls-infinite-recursion.sql`
3. Try logging in again

## What Was Fixed

### 1. RLS Policies
- All admin policies now use `public.is_admin(auth.uid())` instead of recursive queries
- The `is_admin()` function uses `SECURITY DEFINER` to bypass RLS
- This prevents infinite recursion

### 2. AuthContext
- Updated to include `referral_code` when creating profiles manually
- Better error handling for profile creation

### 3. Profile Creation
- Trigger automatically creates profiles with referral codes
- Fallback in AuthContext creates profile if trigger fails

## Testing

After running the fixes:

1. **Test Normal User Login:**
   - Sign up with a new email
   - Should automatically create profile
   - Should be able to login

2. **Test Admin Login:**
   - Login with: `warrenokumu98@gmail.com` / `Twenty37`
   - Should automatically get admin role
   - Should be able to access admin dashboard

3. **Verify Profile Creation:**
   - Check Supabase Table Editor → `profiles` table
   - Should see your user with `referral_code` populated
   - Role should be 'admin' for admin user, 'user' for others

## If Issues Persist

1. **Check if function exists:**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'is_admin';
   ```

2. **Check if policies are updated:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles' AND policyname LIKE '%Admin%';
   ```

3. **Manually create profile if needed:**
   ```sql
   INSERT INTO profiles (user_id, email, role, referral_code)
   VALUES (
     'your-user-id-here',
     'your-email@example.com',
     'user',
     'REF' || SUBSTRING(MD5('your-email@example.com' || 'your-user-id-here') FROM 1 FOR 5)
   );
   ```

4. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles';
   ```

## Notes

- The `is_admin()` function is safe and only checks admin status
- All policies are now non-recursive
- Profile creation is handled automatically by trigger
- Manual profile creation in AuthContext is a fallback only

