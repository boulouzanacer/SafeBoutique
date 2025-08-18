-- Production Admin User Setup Script
-- This script ensures the admin user exists in the production database

-- Check if admin user exists and create if needed
INSERT INTO users (
  id,
  email, 
  password,
  first_name,
  last_name,
  is_admin,
  is_email_verified,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  'boulouza.nacer@gmail.com',
  '$2b$10$YourHashedPasswordHere', -- This will need to be the actual bcrypt hash
  'Nacer',
  'Boulouza',
  true,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'boulouza.nacer@gmail.com'
);

-- Ensure existing user has admin privileges if they exist
UPDATE users 
SET 
  is_admin = true,
  updated_at = NOW()
WHERE 
  email = 'boulouza.nacer@gmail.com' 
  AND is_admin = false;

-- Verify the admin user exists
SELECT 
  id,
  email,
  first_name,
  last_name,
  is_admin,
  created_at
FROM users 
WHERE email = 'boulouza.nacer@gmail.com';