
-- Note: customers table already exists, skipping creation

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies will be added in a later migration after the has_platform_role function is defined

-- Note: Table alterations will be moved to a later migration after the relevant tables are created

-- Note: Trigger already exists, skipping creation
