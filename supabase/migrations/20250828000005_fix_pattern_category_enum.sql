-- Fix pattern_category enum to include new categories for real-time pattern detection

-- First, temporarily change the category column to text to avoid enum dependency issues
ALTER TABLE IF EXISTS public.patterns 
ALTER COLUMN category TYPE TEXT;

-- Drop the existing enum and recreate it with new values
DROP TYPE IF EXISTS public.pattern_category CASCADE;

-- Recreate the enum with all required categories
CREATE TYPE public.pattern_category AS ENUM (
  'transaction',
  'behavioral', 
  'geographic',
  'temporal',
  'structuring',
  'high_risk_corridor',
  'time_pattern',
  'velocity'
);

-- Change the category column back to the enum type
ALTER TABLE IF EXISTS public.patterns 
ALTER COLUMN category TYPE public.pattern_category USING category::public.pattern_category;
