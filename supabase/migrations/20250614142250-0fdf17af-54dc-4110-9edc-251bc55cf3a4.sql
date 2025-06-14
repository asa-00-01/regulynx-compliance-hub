
-- Create policy that allows compliance officers to insert documents for any user
CREATE POLICY "Compliance officers can insert documents for any user" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('complianceOfficer', 'admin')
    )
  );
