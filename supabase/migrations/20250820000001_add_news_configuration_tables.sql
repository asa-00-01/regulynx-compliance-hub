-- Add news configuration tables for multi-tenant news sources and RSS feeds
-- This allows each organization to customize their own news and RSS sources

-- News sources table
CREATE TABLE public.news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  categories TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  last_fetched TIMESTAMPTZ,
  error_count INTEGER DEFAULT 0,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RSS feeds table
CREATE TABLE public.rss_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  feed_url TEXT NOT NULL,
  website_url TEXT,
  categories TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  refresh_interval INTEGER DEFAULT 60 CHECK (refresh_interval >= 1), -- minutes
  last_fetched TIMESTAMPTZ,
  error_count INTEGER DEFAULT 0,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- News configuration table for organization settings
CREATE TABLE public.news_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  default_categories TEXT[] DEFAULT '{}',
  refresh_interval INTEGER DEFAULT 60 CHECK (refresh_interval >= 1), -- minutes
  max_articles_per_source INTEGER DEFAULT 50 CHECK (max_articles_per_source >= 1),
  enable_auto_refresh BOOLEAN DEFAULT true,
  enable_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_id)
);

-- News source templates table for recommended sources
CREATE TABLE public.news_source_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  categories TEXT[] DEFAULT '{}',
  type TEXT NOT NULL CHECK (type IN ('news', 'rss')),
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_news_sources_customer_id ON public.news_sources(customer_id);
CREATE INDEX idx_news_sources_is_active ON public.news_sources(is_active);
CREATE INDEX idx_rss_feeds_customer_id ON public.rss_feeds(customer_id);
CREATE INDEX idx_rss_feeds_is_active ON public.rss_feeds(is_active);
CREATE INDEX idx_news_configurations_customer_id ON public.news_configurations(customer_id);
CREATE INDEX idx_news_source_templates_type ON public.news_source_templates(type);
CREATE INDEX idx_news_source_templates_is_recommended ON public.news_source_templates(is_recommended);

-- Add RLS policies for multi-tenant security
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_source_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for news_sources
CREATE POLICY "Users can view news sources for their organization" ON public.news_sources
  FOR SELECT USING (
    customer_id IN (
      SELECT customer_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage news sources for their organization" ON public.news_sources
  FOR ALL USING (
    customer_id IN (
      SELECT customer_id FROM public.profiles WHERE id = auth.uid()
    ) AND (
      has_customer_role(auth.uid(), 'customer_admin'::customer_role) OR
      has_platform_role(auth.uid(), 'platform_admin'::platform_role)
    )
  );

-- RLS policies for rss_feeds
CREATE POLICY "Users can view RSS feeds for their organization" ON public.rss_feeds
  FOR SELECT USING (
    customer_id IN (
      SELECT customer_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage RSS feeds for their organization" ON public.rss_feeds
  FOR ALL USING (
    customer_id IN (
      SELECT customer_id FROM public.profiles WHERE id = auth.uid()
    ) AND (
      has_customer_role(auth.uid(), 'customer_admin'::customer_role) OR
      has_platform_role(auth.uid(), 'platform_admin'::platform_role)
    )
  );

-- RLS policies for news_configurations
CREATE POLICY "Users can view news configuration for their organization" ON public.news_configurations
  FOR SELECT USING (
    customer_id IN (
      SELECT customer_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage news configuration for their organization" ON public.news_configurations
  FOR ALL USING (
    customer_id IN (
      SELECT customer_id FROM public.profiles WHERE id = auth.uid()
    ) AND (
      has_customer_role(auth.uid(), 'customer_admin'::customer_role) OR
      has_platform_role(auth.uid(), 'platform_admin'::platform_role)
    )
  );

-- RLS policies for news_source_templates (read-only for all users)
CREATE POLICY "Users can view news source templates" ON public.news_source_templates
  FOR SELECT USING (true);

-- Insert some default news source templates
INSERT INTO public.news_source_templates (name, url, description, categories, type, is_recommended) VALUES
  ('FATF News', 'https://fatf-gafi.org/news', 'Financial Action Task Force news and updates', ARRAY['regulation', 'aml', 'sanctions'], 'news', true),
  ('EU Financial Regulation', 'https://europa.eu/financial-regulation', 'European Union financial regulation updates', ARRAY['regulation', 'compliance', 'eu-regulation'], 'news', true),
  ('OFAC Sanctions', 'https://treasury.gov/ofac', 'Office of Foreign Assets Control sanctions updates', ARRAY['sanctions', 'regulation'], 'news', true),
  ('AML Compliance News', 'https://amlcompliance.com', 'Anti-money laundering compliance news', ARRAY['aml', 'compliance', 'best-practices'], 'news', false),
  ('FATF RSS Feed', 'https://fatf-gafi.org/rss', 'FATF RSS feed for automated updates', ARRAY['regulation', 'aml', 'sanctions'], 'rss', true),
  ('EU Regulation RSS', 'https://europa.eu/financial-regulation/rss', 'EU financial regulation RSS feed', ARRAY['regulation', 'compliance', 'eu-regulation'], 'rss', true);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_news_sources_updated_at BEFORE UPDATE ON public.news_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rss_feeds_updated_at BEFORE UPDATE ON public.rss_feeds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_configurations_updated_at BEFORE UPDATE ON public.news_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
