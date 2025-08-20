# AI Agent Edge Function

This Supabase Edge Function provides AI-powered compliance assistance for the Regulynx platform.

## Features

- **OpenAI Integration**: Uses GPT-4o-mini for intelligent responses
- **Mock Mode Fallback**: Falls back to mock responses when OpenAI is unavailable
- **Conversation History**: Maintains context across multiple messages
- **Compliance Focus**: Specialized for AML, KYC, risk assessment, and regulatory compliance
- **Database Logging**: Logs all interactions to the `ai_interactions` table
- **Error Handling**: Robust error handling with graceful fallbacks

## Setup

### 1. Environment Variables

Set the following environment variables in your Supabase project:

```bash
# Required for OpenAI integration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase configuration (usually auto-configured)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to "API Keys" in your account settings
4. Create a new API key
5. Copy the key and add it to your Supabase environment variables

### 3. Deploy the Function

```bash
# Deploy to your Supabase project
supabase functions deploy ai-agent

# Or deploy all functions
supabase functions deploy
```

## Usage

### Frontend Integration

The function is designed to work with the existing `aiAgentService` in your frontend:

```typescript
// The service automatically calls this Edge Function when useMockData is false
const response = await aiAgentService.sendMessage("How do I file a SAR?");
```

### API Endpoint

The function is available at:
```
POST https://your-project.supabase.co/functions/v1/ai-agent
```

### Request Format

```typescript
{
  "message": "How do I file a SAR?",
  "context": {
    "userId": "user-uuid",
    "sessionId": "session-123",
    "conversationHistory": [
      {
        "id": "msg-1",
        "content": "What is AML compliance?",
        "role": "user",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ],
    "userPreferences": {
      "language": "en",
      "expertise": "intermediate",
      "focus": ["aml", "kyc"]
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Response Format

```typescript
{
  "messageId": "ai-1234567890",
  "response": "For filing a SAR, you should document all suspicious transactions...",
  "tools": ["SAR System", "Pattern Detection", "Report Generation"],
  "confidence": 0.93,
  "sources": ["SAR Filing Guidelines", "Suspicious Activity Indicators"],
  "processingTime": 1250
}
```

## Response Categories

The AI categorizes responses based on input keywords:

- **SAR**: Suspicious Activity Reports, reporting, suspicious activity
- **Compliance**: AML, anti-money laundering, transaction monitoring
- **KYC**: Know your customer, verification, customer onboarding
- **General**: Default category for other queries

## Available Tools

The AI can reference these tools in responses:
- RAG System
- Compliance Database
- Risk Engine
- Regulatory Updates
- Case Management
- AML Monitoring System
- Transaction Analysis
- Customer Profiling
- Geographic Risk Assessment
- KYC Database
- Document Verification
- Identity Verification
- Risk Escalation
- Knowledge Base
- Regulatory Database
- SAR System
- Pattern Detection
- Report Generation
- SAR Templates

## Error Handling

The function includes comprehensive error handling:

1. **OpenAI API Failures**: Falls back to mock responses
2. **Authentication Errors**: Returns 401 for invalid tokens
3. **Database Logging Failures**: Continues without failing the request
4. **Invalid Requests**: Returns 400 for missing required fields

## Monitoring

All interactions are logged to the `ai_interactions` table with:
- User ID
- Message content
- AI response
- Tools used
- Confidence score
- Processing time
- Session ID
- User preferences metadata

## Development

### Local Testing

```bash
# Start Supabase locally
supabase start

# Test the function locally
supabase functions serve ai-agent

# Test with curl
curl -X POST http://localhost:54321/functions/v1/ai-agent \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I file a SAR?"}'
```

### Logs

View function logs:
```bash
supabase functions logs ai-agent
```

## Security

- Requires valid JWT authentication
- Validates user permissions
- Sanitizes input data
- Uses environment variables for sensitive data
- Implements CORS headers for web access

## Cost Optimization

- Uses GPT-4o-mini (cheaper than GPT-4)
- Limits max tokens to 1000
- Falls back to mock responses when possible
- Logs interactions for analysis and improvement
