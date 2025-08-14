-- Fix critical security vulnerability in rules table
-- Currently the rules table allows any authenticated user to view AML detection rules
-- This could allow bad actors to study detection algorithms and evade them

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Rules are viewable by authenticated users" ON public.rules;

-- Create restrictive policies that only allow access to authorized compliance personnel
CREATE POLICY "Compliance and admins can view rules" 
ON public.rules 
FOR SELECT 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

CREATE POLICY "Compliance and admins can create rules" 
ON public.rules 
FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

CREATE POLICY "Compliance and admins can update rules" 
ON public.rules 
FOR UPDATE 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]))
WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

CREATE POLICY "Compliance and admins can delete rules" 
ON public.rules 
FOR DELETE 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));