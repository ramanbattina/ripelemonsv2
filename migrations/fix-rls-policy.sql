-- Fix RLS policy for admin product management
-- This allows authenticated users who are admins to manage products

-- Drop the old policy
DROP POLICY IF EXISTS "Admin can manage products" ON "public"."products";

-- Create a new policy that checks if user is authenticated and is an admin
CREATE POLICY "Admin can manage products"
ON "public"."products"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- If you want to allow all authenticated users to update (less secure but simpler):
-- DROP POLICY IF EXISTS "Authenticated users can update products" ON "public"."products";
-- CREATE POLICY "Authenticated users can update products"
-- ON "public"."products"
-- FOR UPDATE
-- TO authenticated
-- USING (true)
-- WITH CHECK (true);

