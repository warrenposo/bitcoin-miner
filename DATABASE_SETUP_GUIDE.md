# Complete Database Setup Guide for BTCMining

This guide will help you set up the complete database schema for the BTCMining application.

## Prerequisites

1. A Supabase project created at https://supabase.com
2. Access to your Supabase SQL Editor

## Setup Steps

### Step 1: Run the Complete Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Open the `complete-database-schema.sql` file
4. Copy and paste the entire SQL code into the SQL Editor
5. Click **Run** to execute the schema

This will create:
- All necessary tables (profiles, support_tickets, deposits, withdrawals, mining_plans, etc.)
- Row Level Security (RLS) policies
- Functions and triggers
- Indexes for performance
- Demo deposit addresses
- Sample mining plans

### Step 2: Create Admin User

The admin user will be automatically created when you sign up with:
- **Email**: `warrenokumu98@gmail.com`
- **Password**: `Twenty37`

The database trigger will automatically assign the `admin` role to this email address.

**If the admin user already exists**, you can manually update their role by running:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'warrenokumu98@gmail.com';
```

### Step 3: Verify Setup

1. Go to **Table Editor** in Supabase
2. Verify that all tables are created:
   - `profiles`
   - `support_tickets`
   - `mining_stats`
   - `deposits`
   - `withdrawals`
   - `mining_plans`
   - `user_plans`
   - `referrals`
   - `referral_commissions`
   - `user_wallets`
   - `deposit_addresses`

3. Check that RLS policies are enabled (they should show as green)

4. Verify the admin user has the correct role:
   ```sql
   SELECT email, role FROM profiles WHERE email = 'warrenokumu98@gmail.com';
   ```

## Database Tables Overview

### Core Tables

1. **profiles** - User profiles with extended fields (phone, address, country, etc.)
2. **support_tickets** - Customer support tickets with file attachments
3. **mining_stats** - User mining statistics (hash rate, total mined, daily earnings)
4. **deposits** - Deposit transactions
5. **withdrawals** - Withdrawal transactions
6. **mining_plans** - Available mining plans (BTC and LTC)
7. **user_plans** - Purchased mining plans by users
8. **referrals** - Referral relationships
9. **referral_commissions** - Referral bonus/commission logs
10. **user_wallets** - User wallet addresses for different cryptocurrencies
11. **deposit_addresses** - Deposit addresses for different gateways (demo addresses)

## Features Implemented

### Authentication & Authorization
- ✅ User registration with automatic profile creation
- ✅ Role-based access control (admin/user)
- ✅ Automatic admin role assignment for specific email
- ✅ Secure password management

### User Dashboard Features
- ✅ View and update mining statistics
- ✅ Create and view support tickets
- ✅ Deposit management with multiple gateways
- ✅ Withdrawal management
- ✅ Purchase mining plans
- ✅ View purchased plans
- ✅ Referral system with commission tracking
- ✅ Profile management (name, email, phone, address, etc.)
- ✅ Wallet address management
- ✅ 2FA security (structure ready)
- ✅ Password change

### Admin Dashboard Features
- ✅ View all users
- ✅ View and manage all support tickets
- ✅ Respond to tickets and update status
- ✅ View all deposits and withdrawals
- ✅ Manage mining plans
- ✅ View platform-wide statistics
- ✅ Access restricted to admin role only

## Demo Data

### Deposit Addresses
Demo addresses are pre-populated for:
- Coinbase
- PayPal
- Stripe
- BTC
- USDT (TRC20 and ERC20)
- USDC
- ETH

**Important**: Update these with real addresses before going live!

### Mining Plans
Sample mining plans are pre-populated for:
- BTC plans (PROMOTIONS, NEW BEGINNER, BASIC, ECONOMY, STANDART, SENIOR, ADVANCED, LUXURIOUS, Vip 1, VIP3)
- LTC plans (Activity Award, BASIC, STANDART, LUXURIOUS)

## Security Features

1. **Row Level Security (RLS)**: All tables have RLS enabled
2. **User Isolation**: Users can only see their own data
3. **Admin Access**: Admins can view and manage all data
4. **Secure Functions**: Database functions run with SECURITY DEFINER
5. **Automatic Triggers**: Profile creation and timestamp updates are automated

## Troubleshooting

### Issue: Cannot login as admin
**Solution**: 
1. Check if the user exists in `auth.users`
2. Verify the profile exists: `SELECT * FROM profiles WHERE email = 'warrenokumu98@gmail.com';`
3. If profile exists but role is 'user', update it: `UPDATE profiles SET role = 'admin' WHERE email = 'warrenokumu98@gmail.com';`

### Issue: Profile not created on signup
**Solution**:
1. Check if the trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. Verify the function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`
3. Re-run the trigger creation section from the SQL file

### Issue: RLS policies blocking access
**Solution**:
1. Check if RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
2. Verify your user's role: `SELECT role FROM profiles WHERE user_id = auth.uid();`
3. Check policy definitions in the SQL file

### Issue: Cannot insert/update data
**Solution**:
1. Verify you're authenticated: Check `auth.uid()` returns your user ID
2. Check RLS policies allow your operation
3. Verify your role has the necessary permissions

## Next Steps

1. **Update Deposit Addresses**: Replace demo addresses with real ones
2. **Customize Mining Plans**: Adjust plan prices, durations, and rewards as needed
3. **Configure Email**: Set up email templates for notifications
4. **Set Up File Storage**: Configure Supabase Storage for ticket attachments
5. **Test All Features**: Test user registration, login, deposits, withdrawals, and admin functions

## Support

If you encounter any issues:
1. Check the Supabase logs in the Dashboard
2. Review the SQL error messages
3. Verify all tables and policies are created correctly
4. Check the browser console for frontend errors

## Important Notes

- All timestamps are stored in UTC
- All monetary values use DECIMAL for precision
- Referral codes are auto-generated on user signup
- Mining stats are automatically created for new users
- Admin role is automatically assigned to `warrenokumu98@gmail.com`

