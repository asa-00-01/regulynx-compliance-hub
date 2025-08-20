
-- First, let's check if these users exist and get their IDs, then assign the appropriate roles

-- Note: User role assignments will be moved to a later migration after the profiles table is created

-- For the customer user, we need to create a customer first if it doesn't exist
-- Let's create a default customer for anwar20xx@gmail.com
INSERT INTO public.customers (name, domain, subscription_tier, settings)
VALUES ('Default Customer', 'anwar20xx.com', 'premium', '{"userCount": 10}')
ON CONFLICT DO NOTHING;

-- Note: User profile updates and role assignments will be moved to a later migration after the profiles table is created
