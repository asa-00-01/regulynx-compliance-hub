
-- First, create a new ENUM type for the user status
CREATE TYPE public.user_status AS ENUM ('verified', 'pending', 'flagged');

-- Then, add the 'risk_score' and 'status' columns to the 'profiles' table
ALTER TABLE public.profiles
ADD COLUMN risk_score INTEGER NOT NULL DEFAULT 0,
ADD COLUMN status public.user_status NOT NULL DEFAULT 'pending';
