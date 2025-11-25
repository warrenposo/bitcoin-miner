# Admin Setup and Verification Guide

## Step 1: Ensure Admin User Exists

### Option A: If Admin User Already Exists

1. Go to Supabase Dashboard → SQL Editor
2. Run the `ensure-admin-role.sql` script to update the admin role:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'warrenokumu98@gmail.com'
   AND role != 'admin';
   ```

### Option B: If Admin User Doesn't Exist Yet

1. Go to your app and navigate to `/signup`
2. Sign up with:
   - **Email**: `warrenokumu98@gmail.com`
   - **Password**: `Twenty37`
   - **Full Name**: (optional)
3. The database trigger will automatically assign the `admin` role

## Step 2: Verify Admin Role in Database

1. Go to Supabase Dashboard → Table Editor → `profiles`
2. Find the row with email `warrenokumu98@gmail.com`
3. Verify the `role` column shows `admin` (not `user`)

## Step 3: Test Admin Login

1. Go to `/login` in your app
2. Login with:
   - **Email**: `warrenokumu98@gmail.com`
   - **Password**: `Twenty37`
3. You should be automatically redirected to `/admin` (not `/dashboard`)

## Step 4: Verify Support Tickets Access

Once logged in as admin:

1. **Check Console**: Open browser DevTools (F12) → Console tab
   - You should see logs like:
     - `Admin Dashboard: Fetching data...`
     - `Tickets fetched: X` (where X is the number of tickets)

2. **Check Admin Dashboard**:
   - You should see the "Support Tickets" section on the left
   - All tickets from all users should be visible
   - You should see ticket details including:
     - Subject
     - User email who created it
     - Status (open, in_progress, resolved, closed)
     - Priority
     - Created date

3. **Test Ticket Response**:
   - Click on any ticket to select it
   - The right panel should show the ticket details
   - You can update the status and add an admin response
   - Click "Update Ticket" to save

## Troubleshooting

### Issue: Admin is redirected to `/dashboard` instead of `/admin`

**Solution**: 
- Check that the profile in the database has `role = 'admin'`
- Run the `ensure-admin-role.sql` script
- Clear browser cache and try logging in again

### Issue: No tickets showing in admin dashboard

**Possible Causes**:
1. **No tickets exist**: Create a ticket as a regular user first
2. **RLS Policy Issue**: Check that RLS policies are enabled in Supabase
3. **Database Error**: Check browser console for error messages

**Solution**:
1. Create a test user account
2. Login as test user and create a support ticket
3. Logout and login as admin
4. Check if the ticket appears

### Issue: "Failed to load tickets" error

**Solution**:
1. Check Supabase Dashboard → Authentication → Policies
2. Verify RLS is enabled on `support_tickets` table
3. Verify the admin policy exists:
   ```sql
   CREATE POLICY "Admins can view all tickets"
   ON support_tickets FOR SELECT
   USING (
     EXISTS (
       SELECT 1 FROM profiles
       WHERE user_id = auth.uid() AND role = 'admin'
     )
   );
   ```

## Quick Test Checklist

- [ ] Admin user exists in `profiles` table with `role = 'admin'`
- [ ] Can login with `warrenokumu98@gmail.com` / `Twenty37`
- [ ] Redirects to `/admin` after login
- [ ] Can see "Support Tickets" section
- [ ] Can see all tickets from all users
- [ ] Can select a ticket and see details
- [ ] Can update ticket status
- [ ] Can add admin response to tickets

## Database Verification Queries

Run these in Supabase SQL Editor to verify setup:

```sql
-- Check admin profile
SELECT id, email, role, created_at
FROM profiles
WHERE email = 'warrenokumu98@gmail.com';

-- Check all tickets (should work as admin)
SELECT COUNT(*) as total_tickets
FROM support_tickets;

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'support_tickets';
```

