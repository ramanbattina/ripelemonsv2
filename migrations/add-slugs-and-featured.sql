-- Migration: Add slugs, featured products, and view packs
-- Run this in Supabase SQL Editor

-- Add columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_order INTEGER;

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;

-- Create view_packs table for pay-as-you-go
CREATE TABLE IF NOT EXISTS view_packs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  views_purchased INTEGER NOT NULL CHECK (views_purchased > 0),
  views_remaining INTEGER NOT NULL CHECK (views_remaining >= 0),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  price_paid DECIMAL(10, 2) NOT NULL,
  payment_processor TEXT,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for view_packs
CREATE INDEX IF NOT EXISTS idx_view_packs_user_id ON view_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_view_packs_user_active ON view_packs(user_id, views_remaining) WHERE views_remaining > 0;

-- Update default monthly_view_limit for new users
-- Note: This only affects new user creation. Existing users need manual update if desired.
-- To update existing free users:
-- UPDATE user_profiles SET monthly_view_limit = 35 WHERE subscription_status = 'free' AND monthly_view_limit = 10;

-- Generate slugs for existing products
-- This creates slugs like "product-name-revenue"
-- Step 1: Convert to lowercase
-- Step 2: Replace non-alphanumeric with single dashes
-- Step 3: Remove leading/trailing dashes and collapse multiple dashes
UPDATE products 
SET slug = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      LOWER(TRIM(name)),
      '[^a-z0-9]+',
      '-',
      'g'
    ),
    '-+',
    '-',
    'g'
  ),
  '^-|-$',
  '',
  'g'
) || '-revenue'
WHERE slug IS NULL OR slug = '';

-- Handle duplicate slugs by adding a number suffix
DO $$
DECLARE
  product_rec RECORD;
  counter INTEGER;
  new_slug TEXT;
BEGIN
  FOR product_rec IN 
    SELECT id, slug, name 
    FROM products 
    WHERE id IN (
      SELECT id 
      FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) as rn
        FROM products
        WHERE slug IS NOT NULL
      ) t 
      WHERE rn > 1
    )
  LOOP
    counter := 1;
    new_slug := product_rec.slug || '-' || counter;
    
    WHILE EXISTS (SELECT 1 FROM products WHERE slug = new_slug AND id != product_rec.id) LOOP
      counter := counter + 1;
      new_slug := product_rec.slug || '-' || counter;
    END LOOP;
    
    UPDATE products SET slug = new_slug WHERE id = product_rec.id;
  END LOOP;
END $$;

