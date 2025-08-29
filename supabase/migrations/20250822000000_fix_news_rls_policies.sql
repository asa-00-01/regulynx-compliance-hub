-- Fix RLS policies for customers table to allow users to create their own default customer
-- and create missing news_source_templates table

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Platform admins can manage customers" ON public.customers;

-- Create new policies that allow users to create their own default customer
CREATE POLICY "Users can create their own default customer" ON public.customers
  FOR INSERT WITH CHECK (
    -- Allow if user is creating a customer for themselves (default customer scenario)
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
        AND p.customer_id IS NULL
    )
    OR
    -- Allow platform admins to manage all customers
    has_platform_role(auth.uid(), 'platform_admin'::platform_role)
  );

CREATE POLICY "Users can view their own customer" ON public.customers
  FOR SELECT USING (
    -- Allow if user belongs to this customer
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
        AND p.customer_id = customers.id
    )
    OR
    -- Allow platform admins to view all customers
    has_platform_role(auth.uid(), 'platform_admin'::platform_role)
  );

CREATE POLICY "Users can update their own customer" ON public.customers
  FOR UPDATE USING (
    -- Allow if user belongs to this customer
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
        AND p.customer_id = customers.id
    )
    OR
    -- Allow platform admins to update all customers
    has_platform_role(auth.uid(), 'platform_admin'::platform_role)
  );

-- Create missing news_source_templates table
CREATE TABLE IF NOT EXISTS public.news_source_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    categories TEXT[] DEFAULT '{}',
    type TEXT NOT NULL CHECK (type IN ('news', 'rss')),
    is_recommended BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on news_source_templates
ALTER TABLE public.news_source_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for news_source_templates
CREATE POLICY "All authenticated users can view news source templates" ON public.news_source_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Platform admins can manage news source templates" ON public.news_source_templates
  FOR ALL USING (has_platform_role(auth.uid(), 'platform_admin'::platform_role));

-- Insert default news source templates
INSERT INTO public.news_source_templates (id, name, url, description, categories, type, is_recommended) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'FATF News', 'https://fatf-gafi.org/news', 'Financial Action Task Force news and updates', ARRAY['regulation', 'aml', 'sanctions'], 'news', true),
  ('550e8400-e29b-41d4-a716-446655440011', 'EU Financial Regulation', 'https://europa.eu/financial-regulation', 'European Union financial regulation updates', ARRAY['regulation', 'compliance', 'eu-regulation'], 'news', true),
  ('550e8400-e29b-41d4-a716-446655440012', 'OFAC Sanctions', 'https://treasury.gov/ofac', 'Office of Foreign Assets Control sanctions updates', ARRAY['sanctions', 'regulation'], 'news', true),
  ('550e8400-e29b-41d4-a716-446655440013', 'AML Compliance News', 'https://amlcompliance.com', 'Anti-money laundering compliance news', ARRAY['aml', 'compliance', 'best-practices'], 'news', false),
  ('550e8400-e29b-41d4-a716-446655440014', 'FATF RSS Feed', 'https://fatf-gafi.org/rss', 'FATF RSS feed for automated updates', ARRAY['regulation', 'aml', 'sanctions'], 'rss', true),
  ('550e8400-e29b-41d4-a716-446655440015', 'EU Regulation RSS', 'https://europa.eu/financial-regulation/rss', 'EU financial regulation RSS feed', ARRAY['regulation', 'compliance', 'eu-regulation'], 'rss', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_source_templates_type ON public.news_source_templates(type);
CREATE INDEX IF NOT EXISTS idx_news_source_templates_is_recommended ON public.news_source_templates(is_recommended);
