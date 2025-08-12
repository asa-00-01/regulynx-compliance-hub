-- Fix security issue: Restrict risk_matches table access to compliance officers and admins only

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert risk matches" ON public.risk_matches;
DROP POLICY IF EXISTS "Risk matches are viewable by authenticated users" ON public.risk_matches;

-- Create secure policies that restrict access to authorized roles only
CREATE POLICY "Compliance and admins can view risk matches" 
ON public.risk_matches 
FOR SELECT 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

CREATE POLICY "Compliance and admins can insert risk matches" 
ON public.risk_matches 
FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

CREATE POLICY "Compliance and admins can update risk matches" 
ON public.risk_matches 
FOR UPDATE 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

CREATE POLICY "Compliance and admins can delete risk matches" 
ON public.risk_matches 
FOR DELETE 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));