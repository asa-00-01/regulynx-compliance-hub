
-- Update the customer_role enum to match our defined CustomerRole type
DROP TYPE IF EXISTS customer_role CASCADE;
CREATE TYPE customer_role AS ENUM ('customer_admin', 'customer_compliance', 'customer_executive', 'customer_support');

-- Update the user_roles table to use the customer_role enum for customer roles
-- First, let's create a separate column for customer roles
ALTER TABLE user_roles ADD COLUMN customer_role customer_role;

-- Update the existing constraint to allow for the new customer role column
-- We'll keep the existing role column for backward compatibility but make it nullable
ALTER TABLE user_roles ALTER COLUMN role DROP NOT NULL;

-- Add a check constraint to ensure either role or customer_role is set, but not both
ALTER TABLE user_roles ADD CONSTRAINT role_or_customer_role_check 
  CHECK ((role IS NOT NULL AND customer_role IS NULL) OR (role IS NULL AND customer_role IS NOT NULL));

-- Update the unique constraint to include customer_role
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_unique_role 
  UNIQUE (user_id, role, customer_id, customer_role);
