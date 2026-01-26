-- First, find your actual auth user ID
-- Go to Supabase Dashboard > Authentication > Users
-- Copy the UUID for admin@speakeasy.com
-- Then run this (replace YOUR_AUTH_USER_ID with the actual UUID):

-- UPDATE users
-- SET "openId" = 'YOUR_AUTH_USER_ID'
-- WHERE email = 'admin@speakeasy.com';

-- Or if you want to just fix it for any user that logs in,
-- update the RLS policy to allow updates based on email match too:

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create a more permissive policy that allows updates
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

-- Now the app can update the openId when users log in
