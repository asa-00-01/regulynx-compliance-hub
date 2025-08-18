# AI Agent Implementation Documentation

## Overview

The AI Agent is a comprehensive compliance assistant that provides intelligent responses to user queries about AML compliance, KYC procedures, risk assessment, and regulatory requirements. The implementation supports both mock data mode and real AI service integration.

## Architecture

### Core Components

1. **AI Agent Service** (`src/services/ai/aiAgentService.ts`)
   - Singleton service managing AI interactions
   - Handles both mock and real AI responses
   - Manages conversation history
   - Provides fallback mechanisms

2. **React Hook** (`src/hooks/useAIAgent.ts`)
   - Manages AI Agent state in React components
   - Handles message sending and response processing
   - Provides error handling and loading states
   - Supports conversation management

3. **Chat Interface** (`src/components/ai-agent/ChatInterface.tsx`)
   - Main UI component for AI interactions
   - Displays conversation history
   - Shows mode indicators (Mock/Live)
   - Provides conversation controls

4. **Supabase Edge Function** (`supabase/functions/ai-agent/index.ts`)
   - Backend service for real AI processing
   - Handles authentication and request validation
   - Logs interactions to database
   - Provides structured responses

## Features

### Mock Data Mode
- **Automatic Detection**: Uses `config.features.useMockData` to determine mode
- **Realistic Responses**: Context-aware responses based on input keywords
- **Tool Simulation**: Random selection of available tools for each response
- **Confidence Scoring**: Realistic confidence levels with slight randomization
- **Processing Time**: Simulated processing delays (800-2000ms)

### Live Mode
- **Real API Integration**: Calls Supabase Edge Function for AI processing
- **Authentication**: Requires valid user session
- **Context Awareness**: Sends conversation history for context
- **Error Handling**: Graceful fallback to mock data on service failure

### Response Categories
1. **Compliance** (AML, transaction monitoring)
2. **KYC** (Customer verification, identity checks)
3. **General** (Platform help, general guidance)

### Available Tools
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

## Data Models

### AIMessage Interface
```typescript
interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  tools?: string[];
  metadata?: {
    confidence?: number;
    sources?: string[];
    processingTime?: number;
  };
}
```

### AIResponse Interface
```typescript
interface AIResponse {
  message: AIMessage;
  tools: string[];
  confidence: number;
  sources: string[];
  processingTime: number;
}
```

### AIContext Interface
```typescript
interface AIContext {
  userId?: string;
  sessionId?: string;
  conversationHistory?: AIMessage[];
  userPreferences?: {
    language?: string;
    expertise?: 'beginner' | 'intermediate' | 'expert';
    focus?: string[];
  };
}
```

## Database Schema

### ai_interactions Table
```sql
CREATE TABLE public.ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    tools_used JSONB DEFAULT '[]',
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    processing_time INTEGER,
    session_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);
```

## Configuration

### Environment Variables
- `VITE_USE_MOCK_DATA`: Enable/disable mock data mode
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key

### Feature Flags
```typescript
features: {
  useMockData: boolean; // Controls AI Agent mode
}
```

## Usage Examples

### Basic Usage
```typescript
import { useAIAgent } from '@/hooks/useAIAgent';

const MyComponent = () => {
  const { messages, isLoading, sendMessage, isMockMode } = useAIAgent();

  const handleAskQuestion = async () => {
    await sendMessage("What are the AML compliance requirements?");
  };

  return (
    <div>
      <p>Mode: {isMockMode ? 'Mock' : 'Live'}</p>
      <button onClick={handleAskQuestion}>Ask AI</button>
    </div>
  );
};
```

### Service Usage
```typescript
import { aiAgentService } from '@/services/ai/aiAgentService';

const response = await aiAgentService.sendMessage("How do I verify customer identity?", {
  userId: "user-123",
  sessionId: "session-456"
});
```

## Mock Data Structure

### Response Categories
```typescript
const mockAIResponses = {
  compliance: [
    {
      content: "Based on our compliance database...",
      tools: ['RAG System', 'Compliance Database'],
      confidence: 0.92,
      sources: ['AML Guidelines 2024', 'FATF Recommendations']
    }
  ],
  kyc: [
    {
      content: "For KYC procedures...",
      tools: ['KYC Database', 'Document Verification'],
      confidence: 0.89,
      sources: ['KYC Procedures Manual']
    }
  ],
  general: [
    {
      content: "I'm here to help...",
      tools: ['RAG System', 'Compliance Database'],
      confidence: 0.85,
      sources: ['General Compliance Guidelines']
    }
  ]
};
```

## Error Handling

### Service Errors
- Network failures fall back to mock data
- Authentication errors show user-friendly messages
- Invalid requests return structured error responses

### UI Error States
- Loading indicators during processing
- Error messages for failed requests
- Confidence warnings for low-confidence responses

## Performance Considerations

### Mock Mode
- Simulated processing delays for realistic UX
- No network overhead
- Instant response generation

### Live Mode
- Network latency considerations
- Request cancellation support
- Response caching (future enhancement)

## Security

### Authentication
- All real API calls require valid user session
- JWT token validation in Edge Function
- User context passed to AI service

### Data Privacy
- Conversation history stored locally
- Optional database logging with user consent
- No sensitive data in mock responses

## Testing

### Mock Data Testing
```typescript
// Test different response categories
await sendMessage("AML compliance"); // Should trigger compliance category
await sendMessage("KYC verification"); // Should trigger KYC category
await sendMessage("Hello"); // Should trigger general category
```

### Mode Switching
```typescript
// Test mode switching
localStorage.setItem('dev_features_useMockData', 'true'); // Enable mock
localStorage.setItem('dev_features_useMockData', 'false'); // Enable live
```

## Future Enhancements

### Planned Features
1. **Response Caching**: Cache common queries for faster responses
2. **Conversation Export**: Export conversation history
3. **Custom Prompts**: User-defined prompt templates
4. **Multi-language Support**: Enhanced internationalization
5. **Voice Input**: Speech-to-text integration
6. **File Upload**: Document analysis capabilities

### AI Model Integration
1. **OpenAI Integration**: GPT-4 for enhanced responses
2. **Custom Fine-tuning**: Domain-specific model training
3. **RAG Enhancement**: Improved retrieval-augmented generation
4. **Real-time Learning**: Continuous model improvement

## Troubleshooting

### Common Issues

1. **Mock Mode Not Working**
   - Check `config.features.useMockData` value
   - Verify localStorage settings
   - Check console for configuration errors

2. **Live Mode Errors**
   - Verify Supabase credentials
   - Check Edge Function deployment
   - Validate user authentication

3. **Response Quality Issues**
   - Check input categorization logic
   - Verify mock response data
   - Review confidence scoring

### Debug Information
```typescript
// Enable debug logging
console.log('AI Agent Debug:', {
  mode: config.features.useMockData ? 'Mock' : 'Live',
  user: user?.id,
  session: !!session
});
```

## API Reference

### AI Agent Service Methods
- `sendMessage(input: string, context?: AIContext): Promise<AIResponse>`
- `getConversationHistory(): AIMessage[]`
- `clearConversationHistory(): void`
- `getAvailableTools(): string[]`

### Hook Return Values
- `messages: AIMessage[]` - Conversation history
- `isLoading: boolean` - Loading state
- `sendMessage: (input: string) => Promise<void>` - Send message function
- `clearConversation: () => void` - Clear conversation
- `isMockMode: boolean` - Current mode indicator
- `availableTools: string[]` - Available AI tools

## Contributing

### Adding New Response Categories
1. Add category to `mockAIResponses`
2. Update `getResponseCategory` function
3. Add corresponding mock data
4. Update documentation

### Adding New Tools
1. Add tool to `availableTools` array
2. Update tool usage in mock responses
3. Update Edge Function tool list
4. Update documentation

### Testing Changes
1. Test in both mock and live modes
2. Verify response categorization
3. Check tool selection logic
4. Validate error handling
