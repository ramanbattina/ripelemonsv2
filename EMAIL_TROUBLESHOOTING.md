# Email Not Receiving Troubleshooting Guide

## Problem
User created an account but didn't receive a confirmation email.

## Common Causes & Solutions

### 1. Check Supabase Email Settings

**Go to Supabase Dashboard:**
1. Navigate to: https://supabase.com/dashboard
2. Select your project: `ikqmkibcfnnjqfazayfm`
3. Go to **Authentication** → **Providers** → **Email**

**Verify these settings:**
- ✅ **Enable email confirmations**: Should be **ON**
- ✅ **Secure email change**: Can be ON or OFF
- ✅ **Double confirm email changes**: Can be ON or OFF

**If "Enable email confirmations" is OFF:**
- Turn it ON and save
- Users will now receive confirmation emails when signing up

### 2. Check Email Provider/SMTP Settings

**In Supabase Dashboard:**
1. Go to **Settings** → **Auth**
2. Check **SMTP Settings** or **Email Settings**

**If using custom SMTP:**
- Verify SMTP credentials are correct
- Test email delivery

**If using Supabase default email service:**
- Check rate limits (free tier has limits)
- Verify domain is not blacklisted

### 3. Check Spam/Junk Folder

- Confirmation emails often go to spam
- Check the spam/junk folder in your email client
- Add Supabase emails to your whitelist/contacts

### 4. Check Email Address

- Verify you signed up with the correct email address
- Check for typos in the email
- Try signing up with a different email to test

### 5. Check Supabase Logs

**In Supabase Dashboard:**
1. Go to **Logs** → **Auth Logs**
2. Look for email sending events
3. Check for any error messages

**Common errors:**
- Rate limit exceeded
- SMTP authentication failed
- Invalid email format
- Email service disabled

### 6. Test Email Delivery

**In Supabase Dashboard:**
1. Go to **Authentication** → **Users**
2. Find the user you created
3. Click on the user
4. Manually trigger email confirmation:
   - Click "Resend confirmation email"
   - Or use SQL: `SELECT auth.send_email_confirmation('user-id-here')`

### 7. Verify Email Template

**In Supabase Dashboard:**
1. Go to **Authentication** → **Email Templates**
2. Check the **Confirm signup** template
3. Verify it includes:
   - `{{ .ConfirmationURL }}` - This should generate the confirmation link
   - Correct subject line
   - Proper email body

### 8. Check Site URL Configuration

**In Supabase Dashboard:**
1. Go to **Authentication** → **URL Configuration**
2. Verify **Site URL** is set to: `https://ripelemons.com`
3. Verify **Redirect URLs** includes:
   - `https://ripelemons.com/auth/callback`
   - `https://ripelemonsv2f.vercel.app/auth/callback`

**Important:** If Site URL is wrong, emails might not send or links might be broken.

### 9. Check Rate Limits

**Supabase Free Tier Limits:**
- 4 emails per hour per user
- 100 emails per day total (free tier)
- If exceeded, emails won't send

**Solutions:**
- Wait and try again later
- Upgrade to a paid plan for higher limits
- Use custom SMTP with no rate limits

### 10. Manual Email Resend

If the above doesn't work, you can manually resend the email:

**Using Supabase Dashboard:**
1. Go to **Authentication** → **Users**
2. Find the user
3. Click on the user
4. Click "Resend confirmation email"

**Using SQL:**
```sql
-- Get user ID first
SELECT id, email FROM auth.users WHERE email = 'user@example.com';

-- Then resend email (replace with actual user ID)
SELECT auth.send_email_confirmation('user-id-here');
```

### 11. Test with Different Email Provider

- Try signing up with Gmail, Outlook, or Yahoo
- Some email providers block emails more aggressively
- Test with a known working email address

### 12. Disable Email Confirmation (Temporary Workaround)

**⚠️ WARNING: Only for testing. Not recommended for production.**

If you need users to access immediately without email confirmation:

1. Go to **Authentication** → **Providers** → **Email**
2. Turn OFF **Enable email confirmations**
3. Save changes

**Note:** This allows anyone with an email address to sign up without verification. Not secure for production.

## Quick Checklist

Run through this checklist:

- [ ] Email confirmations are enabled in Supabase
- [ ] Checked spam/junk folder
- [ ] Verified email address is correct
- [ ] Checked Supabase logs for errors
- [ ] Site URL is set correctly
- [ ] Redirect URLs are whitelisted
- [ ] Not exceeded rate limits
- [ ] Tried resending confirmation email
- [ ] Tested with different email provider

## Still Not Working?

If none of the above works:

1. **Check Supabase Status**: https://status.supabase.com/
2. **Contact Supabase Support**: https://supabase.com/support
3. **Check Email Deliverability**: Use an email testing service

## Testing Email Configuration

To test if emails are working:

1. **Sign up a new test user** with your email
2. **Check email immediately** (should arrive within 1-2 minutes)
3. **Check spam folder** if not in inbox
4. **Click the confirmation link** in the email
5. **Verify redirect** works to `/auth/callback`

## Common Error Messages

**"Email rate limit exceeded"**
- Solution: Wait 1 hour, then try again, or upgrade plan

**"Invalid email address"**
- Solution: Check email format, try different email

**"Email service unavailable"**
- Solution: Check Supabase status, contact support

**"SMTP error"**
- Solution: Check SMTP credentials, test SMTP connection

