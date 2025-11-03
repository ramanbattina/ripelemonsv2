# Migration Guide: Product Slugs and Pay-as-You-Go Pricing

## Step 1: Run Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `migrations/add-slugs-and-featured.sql`
4. Run the migration script

This will:
- Add `slug`, `is_featured`, `featured_order` columns to `products` table
- Create `view_packs` table for pay-as-you-go purchases
- Generate slugs for all existing products
- Create necessary indexes

## Step 2: Set Featured Products

1. Go to `/admin/products` in your application
2. Edit products and check the "Featured Product" checkbox
3. Set `featured_order` (1-10) for up to 10 featured products
4. These 10 products will be visible to guest users

## Step 3: Update Existing Users (Optional)

If you want to update existing free users to have 35 views/month instead of 10:

```sql
UPDATE user_profiles 
SET monthly_view_limit = 35 
WHERE subscription_status = 'free' AND monthly_view_limit = 10;
```

## Step 4: Test the Changes

1. **Test Guest Access:**
   - Log out or use incognito mode
   - Visit homepage - should see only featured products
   - Try accessing a non-featured product - should see upgrade message
   - Try accessing a featured product - should work

2. **Test Registered User:**
   - Log in as a regular user
   - Should see all products
   - Should have 30-40 views/month (check dashboard)
   - After viewing 30-40 products, should see paywall

3. **Test URLs:**
   - Product URLs should now use slugs (e.g., `/product/superx-revenue`)
   - Old numeric URLs won't work (consider adding redirects if needed)

4. **Test Admin:**
   - Go to `/admin/products`
   - Add new product - slug should auto-generate
   - Toggle featured status - should enforce 10 product limit
   - Edit featured order - should affect display order

## Step 5: Update Pricing (if needed)

The pricing page now shows:
- **Free**: 30-40 views/month
- **Pay-as-you-go**: View packs (50 views = $4.99, 100 views = $8.99, 250 views = $19.99)

Payment processing needs to be updated to handle view pack purchases instead of tier subscriptions.

## Notes

- All existing product links using numeric IDs will break
- Consider adding URL redirects from old IDs to new slugs
- Featured products should be manually selected based on quality/popularity
- View packs never expire - users can accumulate views

