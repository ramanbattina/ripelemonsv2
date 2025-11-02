# Admin Credentials Setup Guide

## Prerequisites
- Access to Supabase Dashboard: https://supabase.com/dashboard
- Your Supabase project URL: `https://ikqmkibcfnnjqfazayfm.supabase.co`

## Step 1: Add is_admin Column to Database

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL script:

```sql
-- Add is_admin column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create an index on is_admin for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);
```

## Step 2: Create Admin User Account

You have two options:

### Option A: Create Admin from Existing User

If you already have a user account:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your user account and copy the **User UID** (UUID)
3. Go to **SQL Editor** and run:

```sql
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE id = 'YOUR_USER_UID_HERE';
```

Or update by email:

```sql
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE email = 'your-email@example.com';
```

### Option B: Create New Admin User

1. **Sign up through the app:**
   - Go to https://ripelemonsv2f.vercel.app/
   - Click "Get Started" and create an account
   - Note your email address

2. **Make the user admin:**
   - Go to Supabase Dashboard → **SQL Editor**
   - Run:

```sql
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE email = 'your-email@example.com';
```

## Step 3: Verify Admin Access

1. Log in to your account at https://ripelemonsv2f.vercel.app/
2. Navigate to https://ripelemonsv2f.vercel.app/admin
3. You should now have access to the admin dashboard

## Alternative: Direct Database Insert (Advanced)

If you want to create an admin user directly in the database:

```sql
-- First, create the auth user in Supabase Auth (do this through the dashboard)
-- Then get the UUID and run:

INSERT INTO user_profiles (
  id,
  email,
  full_name,
  subscription_status,
  monthly_view_count,
  monthly_view_limit,
  is_admin
) VALUES (
  'USER_UUID_FROM_AUTH',
  'admin@example.com',
  'Admin User',
  'free',
  0,
  10,
  TRUE
);
```

## Security Notes

- Only users with `is_admin = TRUE` can access admin routes
- Admin routes are protected at `/admin`, `/admin/products`, `/admin/founders`, `/admin/payments`, `/admin/submissions`
- Make sure to keep your admin credentials secure
- Consider setting up Row Level Security (RLS) policies if needed

## Troubleshooting

If you can't access admin routes after setting `is_admin = TRUE`:

1. **Check the database:** Verify `is_admin` is actually `TRUE`:
```sql
SELECT id, email, is_admin FROM user_profiles WHERE email = 'your-email@example.com';
```

2. **Clear browser cache:** Log out and log back in

3. **Check browser console:** Look for any error messages

4. **Verify user profile exists:** Make sure your auth user has a corresponding entry in `user_profiles` table
