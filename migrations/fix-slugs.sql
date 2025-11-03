-- Fix existing slugs that have leading dashes or multiple dashes
-- Run this after the initial migration to fix any malformed slugs

-- First, regenerate all slugs properly
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
WHERE slug IS NOT NULL;

-- Handle duplicate slugs by adding a number suffix
DO $$
DECLARE
  product_rec RECORD;
  counter INTEGER;
  new_slug TEXT;
  base_slug TEXT;
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
    -- Extract base slug without -revenue suffix
    base_slug := REGEXP_REPLACE(product_rec.slug, '-revenue$', '');
    counter := 1;
    new_slug := base_slug || '-' || counter || '-revenue';
    
    WHILE EXISTS (SELECT 1 FROM products WHERE slug = new_slug AND id != product_rec.id) LOOP
      counter := counter + 1;
      new_slug := base_slug || '-' || counter || '-revenue';
    END LOOP;
    
    UPDATE products SET slug = new_slug WHERE id = product_rec.id;
  END LOOP;
END $$;

