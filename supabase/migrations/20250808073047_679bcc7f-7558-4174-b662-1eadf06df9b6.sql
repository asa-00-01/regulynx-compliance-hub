
-- First, let's check if these users exist and get their IDs, then assign the appropriate roles

-- Assign platform_admin role to jinxz2012@gmail.com
INSERT INTO public.platform_roles (user_id, role)
SELECT p.id, 'platform_admin'::platform_role
FROM public.profiles p
WHERE p.email = 'jinxz2012@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- For the customer user, we need to create a customer first if it doesn't exist
-- Let's create a default customer for anwar20xx@gmail.com
INSERT INTO public.customers (name, domain, subscription_tier, settings)
VALUES ('Default Customer', 'anwar20xx.com', 'premium', '{"userCount": 10}')
ON CONFLICT DO NOTHING;

-- Get the customer ID we just created or that already exists
DO $$
DECLARE
    customer_uuid uuid;
    user_uuid uuid;
BEGIN
    -- Get the customer ID (assuming we want the first/default customer)
    SELECT id INTO customer_uuid FROM public.customers LIMIT 1;
    
    -- Get the user ID for anwar20xx@gmail.com
    SELECT id INTO user_uuid FROM public.profiles WHERE email = 'anwar20xx@gmail.com';
    
    -- Update the user's profile to link to this customer
    UPDATE public.profiles 
    SET customer_id = customer_uuid
    WHERE id = user_uuid AND email = 'anwar20xx@gmail.com';
    
    -- Assign customer_admin role to anwar20xx@gmail.com
    INSERT INTO public.user_roles (user_id, customer_id, role)
    VALUES (user_uuid, customer_uuid, 'customer_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
END $$;
