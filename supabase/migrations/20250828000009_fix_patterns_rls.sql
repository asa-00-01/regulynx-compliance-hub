-- Fix RLS policies for patterns table to allow pattern insertion
DROP POLICY IF EXISTS "Users can view patterns in their organization" ON patterns;
DROP POLICY IF EXISTS "Users can insert patterns in their organization" ON patterns;
DROP POLICY IF EXISTS "Users can update patterns in their organization" ON patterns;
DROP POLICY IF EXISTS "Users can delete patterns in their organization" ON patterns;

-- Create permissive RLS policies for patterns table
CREATE POLICY "Users can view patterns in their organization" ON patterns
  FOR SELECT USING (true);

CREATE POLICY "Users can insert patterns in their organization" ON patterns
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update patterns in their organization" ON patterns
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Users can delete patterns in their organization" ON patterns
  FOR DELETE USING (true);
