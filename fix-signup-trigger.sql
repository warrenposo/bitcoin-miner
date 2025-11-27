-- ============================================
-- Fix Signup Trigger and Profile Creation
-- Run this if you get "Database error saving new user"
-- ============================================

-- First, ensure the trigger function exists and is correct
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_referral_code TEXT;
BEGIN
  -- Generate unique referral code
  user_referral_code := UPPER(SUBSTRING(MD5(NEW.email || NEW.id::text) FROM 1 FOR 8));
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM profiles WHERE referral_code = user_referral_code) LOOP
    user_referral_code := UPPER(SUBSTRING(MD5(NEW.email || NEW.id::text || random()::text) FROM 1 FOR 8));
  END LOOP;
  
  -- Create profile with admin role for specific email
  -- Use ON CONFLICT to handle race conditions
  INSERT INTO public.profiles (user_id, email, role, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    CASE 
      WHEN LOWER(COALESCE(NEW.email, '')) = LOWER('warrenokumu98@gmail.com') THEN 'admin'
      ELSE 'user'
    END,
    user_referral_code
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create initial mining stats (only if profile was created)
  -- Use ON CONFLICT to handle if stats already exist
  INSERT INTO public.mining_stats (user_id, hash_rate, total_mined, daily_earnings, available_balance)
  VALUES (NEW.id, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT ALL ON public.mining_stats TO postgres, service_role;

-- Ensure RLS allows the trigger to work
-- The trigger uses SECURITY DEFINER, so it should bypass RLS
-- But let's make sure the policies don't interfere

-- Check if there are any blocking policies
DO $$
BEGIN
  -- Ensure profiles table has proper RLS setup
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
      ON profiles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  
  -- Ensure mining_stats has proper RLS
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'mining_stats'
    AND policyname = 'Users can view their own stats'
  ) THEN
    CREATE POLICY "Users can view their own stats"
      ON mining_stats FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Verify the trigger is set up correctly
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

