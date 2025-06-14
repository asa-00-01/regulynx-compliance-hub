
-- Create enum for user roles if it doesn't exist FIRST
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('complianceOfficer', 'admin', 'executive', 'support');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop ALL policies that depend on the role column
DROP POLICY IF EXISTS "Compliance officers can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Compliance officers can update all documents" ON public.documents;
DROP POLICY IF EXISTS "Compliance officers can insert documents for any user" ON public.documents;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Update the profiles table to use the enum (only if it's not already user_role type)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'role' 
    AND udt_name = 'user_role'
  ) THEN
    -- Add a temporary column with the enum type
    ALTER TABLE public.profiles ADD COLUMN role_temp user_role;
    
    -- Copy data with proper casting
    UPDATE public.profiles 
    SET role_temp = CASE 
      WHEN role = 'complianceOfficer' THEN 'complianceOfficer'::user_role
      WHEN role = 'admin' THEN 'admin'::user_role
      WHEN role = 'executive' THEN 'executive'::user_role
      WHEN role = 'support' THEN 'support'::user_role
      ELSE 'support'::user_role
    END;
    
    -- Drop the old column and rename the temp column
    ALTER TABLE public.profiles DROP COLUMN role;
    ALTER TABLE public.profiles RENAME COLUMN role_temp TO role;
  END IF;
END $$;

-- Set constraints on role column
ALTER TABLE public.profiles 
  ALTER COLUMN role SET NOT NULL,
  ALTER COLUMN role SET DEFAULT 'support'::user_role;

-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to avoid recursive RLS issues
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = user_id;
$$;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create policy for admins to view all profiles - using text comparison
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    public.get_user_role(auth.uid()) = 'admin' OR 
    public.get_user_role(auth.uid()) = 'complianceOfficer'
  );

-- Recreate ALL the documents policies with the new function - using text comparison
CREATE POLICY "Compliance officers can view all documents" 
  ON public.documents 
  FOR SELECT 
  USING (
    public.get_user_role(auth.uid()) = 'complianceOfficer' OR 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Compliance officers can update all documents" 
  ON public.documents 
  FOR UPDATE 
  USING (
    public.get_user_role(auth.uid()) = 'complianceOfficer' OR 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Compliance officers can insert documents for any user" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'complianceOfficer' OR 
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Update the handle_new_user function to use explicit CASE statement for role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'complianceOfficer' THEN 'complianceOfficer'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'executive' THEN 'executive'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'support' THEN 'support'::user_role
      ELSE 'support'::user_role
    END
  );
  RETURN NEW;
END;
$function$;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
