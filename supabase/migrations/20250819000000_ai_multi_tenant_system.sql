-- AI Multi-Tenant System Migration
-- This migration creates the database schema for customer-specific AI configurations

-- 1. Create customer_ai_settings table
CREATE TABLE IF NOT EXISTS public.customer_ai_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    default_configuration_id UUID,
    openai_api_key TEXT,
    custom_tools JSONB DEFAULT '[]',
    custom_categories JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{
        "language": "en",
        "expertise": "intermediate",
        "focus": ["aml", "kyc", "sar"],
        "responseStyle": "detailed"
    }',
    limits JSONB DEFAULT '{
        "maxRequestsPerDay": 1000,
        "maxTokensPerRequest": 1000,
        "maxConversationLength": 50
    }',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(customer_id)
);

-- 2. Create ai_configurations table
CREATE TABLE IF NOT EXISTS public.ai_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    available_tools JSONB DEFAULT '[]',
    response_categories JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{
        "maxTokens": 1000,
        "temperature": 0.7,
        "model": "gpt-4o-mini",
        "enableMockMode": false,
        "enableDatabaseLogging": true,
        "enableConversationHistory": true,
        "maxHistoryLength": 10
    }',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create ai_interactions table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    tools_used JSONB DEFAULT '[]',
    confidence DECIMAL(3,2) DEFAULT 0.0,
    processing_time INTEGER DEFAULT 0,
    session_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Update ai_interactions table to support multi-tenancy
ALTER TABLE public.ai_interactions 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS configuration_id UUID REFERENCES public.ai_configurations(id) ON DELETE SET NULL;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_ai_settings_customer_id ON public.customer_ai_settings(customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_customer_id ON public.ai_configurations(customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_active ON public.ai_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_customer_id ON public.ai_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_configuration_id ON public.ai_interactions(configuration_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_customer_created ON public.ai_interactions(customer_id, created_at);

-- 6. Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_ai_settings_updated_at 
    BEFORE UPDATE ON public.customer_ai_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_configurations_updated_at 
    BEFORE UPDATE ON public.ai_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Insert default AI configurations for existing customers
INSERT INTO public.ai_configurations (id, customer_id, name, description, system_prompt, available_tools, response_categories, settings)
SELECT 
    gen_random_uuid(),
    c.id,
    'Default Compliance Assistant',
    'Default AI configuration for compliance assistance',
    'You are an AI Compliance Assistant for a financial services platform. You help with AML (Anti-Money Laundering), KYC (Know Your Customer), risk assessment, and regulatory compliance.

Your expertise includes:
- AML monitoring and transaction analysis
- KYC procedures and customer verification
- Risk assessment and scoring
- Suspicious Activity Reports (SARs)
- Regulatory compliance and reporting
- Case management and investigation

Provide clear, practical guidance based on compliance best practices. Always consider regulatory requirements and risk factors. Be specific and actionable in your responses.',
    '["RAG System", "Compliance Database", "Risk Engine", "Regulatory Updates", "Case Management", "AML Monitoring System", "Transaction Analysis", "Customer Profiling", "Geographic Risk Assessment", "KYC Database", "Document Verification", "Identity Verification", "Risk Escalation", "Knowledge Base", "Regulatory Database", "SAR System", "Pattern Detection", "Report Generation", "SAR Templates"]',
    '{
        "compliance": {
            "name": "AML & Compliance",
            "description": "Anti-money laundering and regulatory compliance",
            "responses": [
                {
                    "content": "Based on our compliance database, I can provide guidance on AML compliance. The key areas to focus on include customer due diligence, transaction monitoring, and suspicious activity reporting. Our system flags transactions above $10,000 and monitors for unusual patterns.",
                    "tools": ["RAG System", "Compliance Database", "Regulatory Updates"],
                    "confidence": 0.92,
                    "sources": ["AML Guidelines 2024", "FATF Recommendations", "Local Regulatory Framework"]
                }
            ]
        },
        "kyc": {
            "name": "KYC & Verification",
            "description": "Know Your Customer procedures and verification",
            "responses": [
                {
                    "content": "For KYC procedures, you''ll need to verify identity documents, assess risk level, and conduct enhanced due diligence for high-risk customers. Our system supports document verification, risk scoring, and automated compliance checks.",
                    "tools": ["KYC Database", "Document Verification", "Risk Assessment"],
                    "confidence": 0.89,
                    "sources": ["KYC Procedures Manual", "Identity Verification Standards", "Enhanced Due Diligence Guidelines"]
                }
            ]
        },
        "sar": {
            "name": "SAR & Reporting",
            "description": "Suspicious Activity Reports and regulatory reporting",
            "responses": [
                {
                    "content": "For Suspicious Activity Reports (SARs), you should document all suspicious transactions, patterns, or behaviors. Our system helps identify potential SAR triggers and provides templates for filing reports with regulatory authorities.",
                    "tools": ["SAR System", "Pattern Detection", "Report Generation"],
                    "confidence": 0.93,
                    "sources": ["SAR Filing Guidelines", "Suspicious Activity Indicators", "Regulatory Reporting Requirements"]
                }
            ]
        },
        "general": {
            "name": "General Assistance",
            "description": "General compliance and platform assistance",
            "responses": [
                {
                    "content": "I''m here to help with your compliance questions. I can assist with AML monitoring, KYC procedures, risk assessment, regulatory updates, and case management. What specific area would you like to explore?",
                    "tools": ["RAG System", "Compliance Database"],
                    "confidence": 0.85,
                    "sources": ["General Compliance Guidelines", "Platform Documentation"]
                }
            ]
        }
    }',
    '{
        "maxTokens": 1000,
        "temperature": 0.7,
        "model": "gpt-4o-mini",
        "enableMockMode": false,
        "enableDatabaseLogging": true,
        "enableConversationHistory": true,
        "maxHistoryLength": 10
    }'
FROM public.customers c
WHERE NOT EXISTS (
    SELECT 1 FROM public.ai_configurations ac WHERE ac.customer_id = c.id
);

-- 8. Insert default customer AI settings for existing customers
INSERT INTO public.customer_ai_settings (customer_id, default_configuration_id, preferences, limits)
SELECT 
    c.id,
    ac.id,
    '{
        "language": "en",
        "expertise": "intermediate",
        "focus": ["aml", "kyc", "sar"],
        "responseStyle": "detailed"
    }',
    '{
        "maxRequestsPerDay": 1000,
        "maxTokensPerRequest": 1000,
        "maxConversationLength": 50
    }'
FROM public.customers c
JOIN public.ai_configurations ac ON ac.customer_id = c.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.customer_ai_settings cas WHERE cas.customer_id = c.id
);

-- 9. Update existing ai_interactions to set customer_id (if not already set)
UPDATE public.ai_interactions 
SET customer_id = (
    SELECT c.id 
    FROM public.customers c 
    JOIN public.profiles p ON p.customer_id = c.id 
    WHERE p.id = ai_interactions.user_id
)
WHERE customer_id IS NULL;

-- 10. Add RLS policies for multi-tenant security
ALTER TABLE public.customer_ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;

-- Customer AI settings policies
CREATE POLICY "Customers can view their own AI settings" ON public.customer_ai_settings
    FOR SELECT USING (
        customer_id IN (
            SELECT customer_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Customers can update their own AI settings" ON public.customer_ai_settings
    FOR UPDATE USING (
        customer_id IN (
            SELECT customer_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Customers can insert their own AI settings" ON public.customer_ai_settings
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT customer_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- AI configurations policies
CREATE POLICY "Customers can view their own AI configurations" ON public.ai_configurations
    FOR SELECT USING (
        customer_id IN (
            SELECT customer_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Customers can update their own AI configurations" ON public.ai_configurations
    FOR UPDATE USING (
        customer_id IN (
            SELECT customer_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Customers can insert their own AI configurations" ON public.ai_configurations
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT customer_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- AI interactions policies (update existing)
DROP POLICY IF EXISTS "Users can view their own AI interactions" ON public.ai_interactions;
CREATE POLICY "Users can view their own AI interactions" ON public.ai_interactions
    FOR SELECT USING (
        user_id = auth.uid() OR
        customer_id IN (
            SELECT customer_id FROM public.profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own AI interactions" ON public.ai_interactions;
CREATE POLICY "Users can insert their own AI interactions" ON public.ai_interactions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        customer_id IN (
            SELECT customer_id FROM public.profiles WHERE id = auth.uid()
        )
    );
