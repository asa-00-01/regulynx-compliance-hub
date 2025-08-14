-- Fix critical security vulnerability in profiles table
-- Currently any authenticated user can view all profiles which exposes sensitive data

-- Drop the overly permissive policy that allows all authenticated users to see all profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Create more restrictive policies for profile access
-- Policy 1: Platform admins can view all profiles (for platform management)
CREATE POLICY "Platform admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_platform_role(auth.uid(), 'platform_admin'::platform_role));

-- Policy 2: Users within the same customer organization can view each other's profiles
CREATE POLICY "Customer users can view profiles within their organization" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles ur1 
    JOIN user_roles ur2 ON ur1.customer_id = ur2.customer_id
    WHERE ur1.user_id = auth.uid() 
    AND ur2.user_id = profiles.id
    AND ur1.customer_id IS NOT NULL
  )
);

-- Policy 3: Users can still view their own profile (this policy already exists)
-- "Users can view their own profile" policy is already in place

-- Policy 4: Admins and compliance officers can view all profiles (this policy already exists)  
-- "Admins can view all profiles" policy is already in place