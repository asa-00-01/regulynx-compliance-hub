
-- Enable Row Level Security on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to INSERT their own documents
CREATE POLICY "Users can insert their own documents" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to SELECT their own documents
CREATE POLICY "Users can view their own documents" 
  ON public.documents 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own documents
CREATE POLICY "Users can update their own documents" 
  ON public.documents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own documents
CREATE POLICY "Users can delete their own documents" 
  ON public.documents 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policy that allows compliance officers to view all documents
CREATE POLICY "Compliance officers can view all documents" 
  ON public.documents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('complianceOfficer', 'admin')
    )
  );

-- Create policy that allows compliance officers to update all documents
CREATE POLICY "Compliance officers can update all documents" 
  ON public.documents 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('complianceOfficer', 'admin')
    )
  );
