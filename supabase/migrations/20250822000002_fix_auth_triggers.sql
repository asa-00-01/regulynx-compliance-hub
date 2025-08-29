-- Fix auth trigger functions to handle signup errors
-- This migration addresses potential issues with the handle_new_user trigger

-- Drop existing trigger to recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if profile already exists to avoid conflicts
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, name, email, role, status)
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
      END,
      'active'
    );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also fix the assign_default_customer_role function
DROP TRIGGER IF EXISTS assign_default_role ON public.profiles;

CREATE OR REPLACE FUNCTION public.assign_default_customer_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only assign default role if no platform role exists and no customer role exists
  IF NOT EXISTS (SELECT 1 FROM public.platform_roles WHERE user_id = NEW.id) 
     AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer_support')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the profile creation
    RAISE WARNING 'Error in assign_default_customer_role trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER assign_default_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_customer_role();
