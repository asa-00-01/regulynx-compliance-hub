-- This migration allows anonymous access to aml_transactions for testing

-- Drop existing restrictive policies on aml_transactions
DROP POLICY IF EXISTS "Customer users can manage their organization's transactions" ON aml_transactions;
DROP POLICY IF EXISTS "Platform admins can view all transactions" ON aml_transactions;

-- Create a permissive policy for testing
CREATE POLICY "Allow all access for testing" ON aml_transactions
  FOR ALL USING (true)
  WITH CHECK (true);
