# AI Multi-Tenant System Documentation

## Overview

The AI Multi-Tenant System allows each customer in the SaaS platform to have their own customized AI assistant configurations, settings, and usage limits. This ensures data isolation, customization capabilities, and proper resource management across different customer organizations.

## Architecture

### Core Components

1. **Customer AI Settings** (`customer_ai_settings` table)
   - Stores customer-specific preferences and limits
   - Manages default AI configuration
   - Tracks usage limits and preferences

2. **AI Configurations** (`ai_configurations` table)
   - Customer-specific AI assistant configurations
   - Custom system prompts, tools, and response categories
   - Configurable settings for AI behavior

3. **AI Interactions** (`ai_interactions` table)
   - Logs all AI interactions with customer context
   - Tracks usage for billing and analytics
   - Stores conversation history and metadata

### Database Schema

```sql
-- Customer AI Settings
CREATE TABLE customer_ai_settings (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    default_configuration_id UUID,
    openai_api_key TEXT,
    custom_tools JSONB,
    custom_categories JSONB,
    preferences JSONB,
    limits JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- AI Configurations
CREATE TABLE ai_configurations (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    available_tools JSONB,
    response_categories JSONB,
    settings JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- AI Interactions (enhanced)
CREATE TABLE ai_interactions (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    configuration_id UUID REFERENCES ai_configurations(id),
    user_id UUID REFERENCES profiles(id),
    message TEXT,
    response TEXT,
    tools_used JSONB,
    confidence DECIMAL,
    processing_time INTEGER,
    session_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ
);
```

## Features

### 1. Customer-Specific AI Configurations

Each customer can create multiple AI configurations with:
- **Custom System Prompts**: Define the AI's role and behavior
- **Available Tools**: Select which tools the AI can use
- **Response Categories**: Customize responses for different topics
- **Settings**: Configure model parameters, temperature, etc.

### 2. Usage Management

- **Daily Request Limits**: Configurable per customer
- **Token Limits**: Control response length and complexity
- **Conversation Limits**: Manage conversation history length
- **Usage Tracking**: Monitor and log all interactions

### 3. Multi-Tenant Security

- **Row Level Security (RLS)**: Ensures data isolation
- **Customer-Specific Access**: Users can only access their organization's data
- **Configuration Isolation**: Each customer's AI configurations are private

### 4. Configuration Management

- **Default Configurations**: Set preferred AI configuration
- **Multiple Configurations**: Create different AI assistants for different use cases
- **Version Control**: Track configuration changes over time

## Implementation

### Service Layer

#### CustomerAIService
```typescript
class CustomerAIService {
  // Get customer AI settings
  async getCustomerAISettings(customerId: string): Promise<CustomerAISettings>
  
  // Get AI configuration
  async getAIConfiguration(configurationId: string): Promise<AIConfiguration>
  
  // Create/update configurations
  async createAIConfiguration(customerId: string, config: AIConfiguration): Promise<string>
  async updateAIConfiguration(configId: string, updates: Partial<AIConfiguration>): Promise<boolean>
  
  // Usage management
  async checkUsageLimits(customerId: string): Promise<UsageLimits>
  async logInteraction(interaction: AIInteraction): Promise<boolean>
}
```

#### AIAgentService (Enhanced)
```typescript
class AIAgentService {
  // Initialize for specific customer
  async initializeForCustomer(customerId: string, configurationId?: string): Promise<boolean>
  
  // Send message with customer context
  async sendMessage(input: string, context?: AIContext): Promise<AIResponse>
  
  // Get customer-specific tools and configurations
  getAvailableTools(): string[]
  getCurrentConfiguration(): AIConfiguration | null
}
```

### Frontend Components

#### AIConfigurationManager
- Create and manage AI configurations
- Set default configurations
- Configure tools and response categories
- Manage customer preferences

#### Enhanced ChatInterface
- Customer-specific AI initialization
- Usage limit indicators
- Configuration-aware responses
- Real-time usage tracking

## Configuration Examples

### Basic Compliance Assistant
```json
{
  "name": "Compliance Assistant",
  "systemPrompt": "You are an AI Compliance Assistant for a financial services platform...",
  "availableTools": ["RAG System", "Compliance Database", "Risk Engine"],
  "responseCategories": {
    "compliance": {
      "name": "AML & Compliance",
      "responses": [...]
    }
  },
  "settings": {
    "maxTokens": 1000,
    "temperature": 0.7,
    "model": "gpt-4o-mini"
  }
}
```

### Advanced KYC Specialist
```json
{
  "name": "KYC Specialist",
  "systemPrompt": "You are a KYC specialist with expertise in customer verification...",
  "availableTools": ["KYC Database", "Document Verification", "Identity Verification"],
  "responseCategories": {
    "kyc": {
      "name": "KYC & Verification",
      "responses": [...]
    }
  },
  "settings": {
    "maxTokens": 1500,
    "temperature": 0.5,
    "model": "gpt-4o-mini"
  }
}
```

## Usage Workflow

### 1. Customer Onboarding
1. Customer signs up for the platform
2. System creates default AI configuration
3. Customer can customize settings and create additional configurations
4. Usage limits are set based on subscription plan

### 2. AI Interaction
1. User accesses AI Agent page
2. System initializes AI with customer's default configuration
3. User sends message
4. System checks usage limits
5. AI processes request using customer-specific settings
6. Interaction is logged with customer context
7. Response is returned with customer-specific tools and sources

### 3. Configuration Management
1. Admin accesses Configuration tab
2. Creates or modifies AI configurations
3. Sets default configuration
4. Configures tools and response categories
5. Updates customer preferences and limits

## Security Considerations

### Data Isolation
- All AI interactions are tagged with customer ID
- RLS policies ensure customers can only access their own data
- Configuration isolation prevents cross-customer data leakage

### Usage Limits
- Daily request limits prevent abuse
- Token limits control costs
- Conversation limits manage storage

### API Security
- Customer-specific API keys (optional)
- Request validation and sanitization
- Rate limiting per customer

## Monitoring and Analytics

### Usage Tracking
- Daily request counts per customer
- Tool usage statistics
- Response confidence metrics
- Processing time analysis

### Performance Metrics
- Response times by configuration
- Error rates and types
- Customer satisfaction scores
- Cost analysis per customer

## Future Enhancements

### Planned Features
1. **A/B Testing**: Test different AI configurations
2. **Learning from Interactions**: Improve responses based on usage
3. **Custom Training**: Customer-specific model fine-tuning
4. **Advanced Analytics**: Detailed usage insights and recommendations
5. **Integration APIs**: Connect with external AI services
6. **Multi-language Support**: Customer-specific language preferences

### Scalability Considerations
1. **Caching**: Cache frequently used configurations
2. **Load Balancing**: Distribute AI requests across multiple instances
3. **Database Optimization**: Indexes for fast customer data retrieval
4. **CDN Integration**: Cache AI responses for common queries

## Troubleshooting

### Common Issues

1. **Configuration Not Loading**
   - Check customer ID in user profile
   - Verify RLS policies
   - Check database connectivity

2. **Usage Limits Exceeded**
   - Verify daily limits in customer settings
   - Check interaction logging
   - Review subscription plan limits

3. **AI Responses Not Customized**
   - Verify default configuration is set
   - Check configuration is active
   - Review system prompt and tools

### Debug Tools
- Console logging for AI initialization
- Database queries for configuration verification
- Usage limit checking utilities
- Configuration validation tools

## Migration Guide

### From Single-Tenant to Multi-Tenant

1. **Database Migration**
   - Run the AI multi-tenant migration
   - Update existing interactions with customer IDs
   - Create default configurations for existing customers

2. **Code Updates**
   - Update AI service calls to include customer context
   - Modify frontend to handle customer-specific initialization
   - Add configuration management components

3. **Testing**
   - Verify data isolation between customers
   - Test configuration management
   - Validate usage limits and tracking

This multi-tenant AI system provides a robust, scalable, and secure foundation for customer-specific AI assistants while maintaining data isolation and providing comprehensive customization options.
