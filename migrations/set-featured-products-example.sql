-- Example: Set 7 more products as featured
-- Replace the product names with your actual product names
-- Or use product IDs instead

-- Option 1: Using Product Names
UPDATE products 
SET is_featured = true, featured_order = 4 
WHERE name = 'Feather.so';

UPDATE products 
SET is_featured = true, featured_order = 5 
WHERE name = 'Xnapper';

UPDATE products 
SET is_featured = true, featured_order = 6 
WHERE name = 'SuperBlog.ai';

UPDATE products 
SET is_featured = true, featured_order = 7 
WHERE name = 'Black Magic';

UPDATE products 
SET is_featured = true, featured_order = 8 
WHERE name = 'DevUtils';

UPDATE products 
SET is_featured = true, featured_order = 9 
WHERE name = 'Bannerbear';

UPDATE products 
SET is_featured = true, featured_order = 10 
WHERE name = 'Remote OK';

-- Option 2: Using Product IDs (if you know them)
-- UPDATE products SET is_featured = true, featured_order = 4 WHERE id = 4;
-- UPDATE products SET is_featured = true, featured_order = 5 WHERE id = 5;
-- UPDATE products SET is_featured = true, featured_order = 6 WHERE id = 6;
-- UPDATE products SET is_featured = true, featured_order = 7 WHERE id = 7;
-- UPDATE products SET is_featured = true, featured_order = 8 WHERE id = 8;
-- UPDATE products SET is_featured = true, featured_order = 9 WHERE id = 9;
-- UPDATE products SET is_featured = true, featured_order = 10 WHERE id = 10;

-- Verify your featured products:
SELECT id, name, is_featured, featured_order 
FROM products 
WHERE is_featured = true
ORDER BY featured_order ASC NULLS LAST;

