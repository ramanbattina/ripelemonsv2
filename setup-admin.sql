-- Add is_admin column to user_profiles table if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create an index on is_admin for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);

-- Instructions to create admin user:
-- 1. First, sign up a user account through the app at https://ripelemonsv2f.vercel.app/
--    OR manually create a user in Supabase Auth
-- 2. Once you have the user's ID (uuid), run the following SQL to make them admin:
--
-- UPDATE user_profiles 
-- SET is_admin = TRUE 
-- WHERE id = 'YOUR_USER_ID_HERE';
--
-- OR if you want to make a user admin by email:
--
-- UPDATE user_profiles 
-- SET is_admin = TRUE 
-- WHERE email = 'admin@example.com';

-- Example: Make a specific user admin (replace with actual user ID)
-- UPDATE user_profiles SET is_admin = TRUE WHERE email = 'your-admin-email@example.com';

