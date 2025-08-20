
-- Update the customer_role enum to match our defined CustomerRole type
DROP TYPE IF EXISTS customer_role CASCADE;
CREATE TYPE customer_role AS ENUM ('customer_admin', 'customer_compliance', 'customer_executive', 'customer_support');

-- Note: user_roles table alterations will be moved to a later migration after the user_roles table is created
