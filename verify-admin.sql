-- Quick Admin User Verification Script
-- Run this in Supabase SQL Editor to check your admin user status

-- 1. Check if is_admin column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'is_admin';

-- 2. List all users and their admin status
SELECT 
  id,
  email,
  full_name,
  subscription_status,
  is_admin,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 3. Check specific user by email (replace with your email)
SELECT 
  id,
  email,
  full_name,
  is_admin,
  subscription_status
FROM user_profiles
WHERE email = 'admin@ripelemons.com'; -- Replace with your admin email

-- 4. If is_admin is NULL or FALSE, set it to TRUE for your admin user
-- UPDATE user_profiles 
-- SET is_admin = TRUE 
-- WHERE email = 'admin@ripelemons.com'; -- Replace with your admin email

-- 5. Verify the update worked
-- SELECT email, is_admin FROM user_profiles WHERE email = 'admin@ripelemons.com';

