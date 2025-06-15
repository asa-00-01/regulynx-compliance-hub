
-- Add an email column to the profiles table
ALTER TABLE public.profiles ADD COLUMN email TEXT;

-- Backfill email addresses for existing users from the auth.users table
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- Add NOT NULL and UNIQUE constraints to the new email column
ALTER TABLE public.profiles
ALTER COLUMN email SET NOT NULL,
ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Update the function that handles new user creation to include the email
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
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
$function$
