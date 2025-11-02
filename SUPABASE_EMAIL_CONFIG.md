# Supabase Email Redirect Configuration

## Problem
When users sign up, Supabase sends confirmation emails with redirect URLs that use `localhost:3000` instead of your production URL. This needs to be configured in Supabase.

## Solution

### Step 1: Configure Redirect URLs in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `ikqmkibcfnnjqfazayfm`

2. **Navigate to Authentication Settings**
   - Go to **Authentication** → **URL Configuration**
   - Or go to **Settings** → **Auth** → **URL Configuration**

3. **Add Site URL**
   - **Site URL**: `https://ripelemons.com` (or `https://ripelemonsv2f.vercel.app`)
   - This is your production URL - use your custom domain if available

4. **Add Redirect URLs**
   Add these URLs to the **Redirect URLs** list (add both custom domain and Vercel URL):
   ```
   https://ripelemons.com/auth/callback
   https://ripelemons.com/reset-password
   https://ripelemons.com/dashboard
   https://ripelemonsv2f.vercel.app/auth/callback
   https://ripelemonsv2f.vercel.app/reset-password
   https://ripelemonsv2f.vercel.app/dashboard
   ```

### Step 2: Configure Email Templates (Optional but Recommended)

1. **Go to Authentication** → **Email Templates**

2. **Update Confirmation Email**
   - The email template uses `{{ .ConfirmationURL }}` which should automatically use your Site URL
   - Verify the email template includes the correct redirect link

3. **Update Password Reset Email**
   - Similarly, password reset emails should use your Site URL
   - Template uses `{{ .ConfirmationURL }}`

### Step 3: Verify Environment Variables (Already Set)

The code already uses environment variables. If you need to override for production, you can add these to Vercel:

- `VITE_EMAIL_REDIRECT_URL`: `https://ripelemons.com` (or your custom domain)
- `VITE_PUBLIC_URL`: `https://ripelemons.com` (or your custom domain)

But this is optional - the code defaults to `https://ripelemons.com` for email redirects.

## Testing

1. **Test Email Confirmation**
   - Sign up with a new email
   - Check your email for the confirmation link
   - The link should point to `https://ripelemons.com/auth/callback#...` (or your custom domain)
   - Click the link and verify it redirects correctly

2. **Test Password Reset**
   - Request a password reset
   - Check your email for the reset link
   - The link should point to `https://ripelemons.com/reset-password#...` (or your custom domain)
   - Click the link and verify it redirects correctly

## Important Notes

- **After changing Site URL**, existing email links will still use the old URL until new emails are sent
- **All users** who receive new confirmation/reset emails will get the correct production URL
- The **Site URL** setting is the default for all email redirects
- The **Redirect URLs** list determines which URLs are allowed (security)

## Troubleshooting

### Issue: Emails still show localhost
- **Solution**: Clear browser cache and cookies, or wait for new emails to be sent
- **Check**: Verify Site URL in Supabase dashboard is set to production URL

### Issue: "Invalid redirect URL" error
- **Solution**: Add the redirect URL to the "Redirect URLs" whitelist in Supabase
- **Check**: Make sure the URL matches exactly (including https://)

### Issue: Links don't work
- **Solution**: Verify the `/auth/callback` route exists (it's been added to the code)
- **Check**: Make sure the route is deployed to production

## Code Changes Made

1. ✅ Created `lib/config.ts` - Handles redirect URL configuration
2. ✅ Created `pages/AuthCallback.tsx` - Handles email confirmation callbacks
3. ✅ Updated `contexts/AuthContext.tsx` - Uses production URL for email redirects
4. ✅ Added `/auth/callback` route to `App.tsx`

All changes are committed and ready for deployment.
