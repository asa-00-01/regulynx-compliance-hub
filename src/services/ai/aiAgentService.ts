import { config } from '@/config/environment';
import { supabase } from '@/integrations/supabase/client';

export interface AIMessage {
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

export interface AIResponse {
  message: AIMessage;
  tools: string[];
  confidence: number;
  sources: string[];
  processingTime: number;
}

export interface AIContext {
  userId?: string;
  sessionId?: string;
  conversationHistory?: AIMessage[];
  userPreferences?: {
    language?: string;
    expertise?: 'beginner' | 'intermediate' | 'expert';
    focus?: string[];
  };
}

// Mock data for AI responses
const mockAIResponses = {
  compliance: [
    {
      content: "Based on our compliance database, I can provide guidance on that topic. Let me analyze the current regulatory requirements for AML compliance. The key areas to focus on include customer due diligence, transaction monitoring, and suspicious activity reporting.",
      tools: ['RAG System', 'Compliance Database', 'Regulatory Updates'],
      confidence: 0.92,
      sources: ['AML Guidelines 2024', 'FATF Recommendations', 'Local Regulatory Framework']
    },
    {
      content: "I've searched through our AML monitoring system and found relevant patterns. Here's what I can tell you about transaction monitoring: The system should flag transactions above $10,000, unusual patterns, and high-risk jurisdictions.",
      tools: ['AML Monitoring System', 'Risk Engine', 'Transaction Analysis'],
      confidence: 0.88,
      sources: ['Transaction Monitoring Guidelines', 'Risk Assessment Framework', 'Case Studies Database']
    },
    {
      content: "Using our risk assessment tools, I can help evaluate this scenario. The key factors to consider are: customer risk profile, transaction patterns, geographic risk, and product risk. Let me provide a detailed analysis.",
      tools: ['Risk Engine', 'Customer Profiling', 'Geographic Risk Assessment'],
      confidence: 0.95,
      sources: ['Risk Assessment Methodology', 'Customer Due Diligence Guidelines', 'Geographic Risk Database']
    }
  ],
  kyc: [
    {
      content: "I've consulted our KYC knowledge base and case history. Here's my analysis: For new customer onboarding, you'll need to verify identity documents, assess risk level, and conduct enhanced due diligence for high-risk customers.",
      tools: ['KYC Database', 'Document Verification', 'Risk Assessment'],
      confidence: 0.89,
      sources: ['KYC Procedures Manual', 'Identity Verification Standards', 'Enhanced Due Diligence Guidelines']
    },
    {
      content: "Drawing from our compliance framework and recent updates, I recommend the following approach for customer verification: Start with basic identity verification, then escalate to enhanced due diligence if risk factors are present.",
      tools: ['Compliance Framework', 'Identity Verification', 'Risk Escalation'],
      confidence: 0.91,
      sources: ['Customer Verification Standards', 'Risk Escalation Procedures', 'Recent Regulatory Updates']
    }
  ],
  general: [
    {
      content: "I'm here to help with your compliance questions. I can assist with AML monitoring, KYC procedures, risk assessment, regulatory updates, and case management. What specific area would you like to explore?",
      tools: ['RAG System', 'Compliance Database'],
      confidence: 0.85,
      sources: ['General Compliance Guidelines', 'Platform Documentation']
    },
    {
      content: "I can provide guidance on various compliance topics including transaction monitoring, customer due diligence, suspicious activity reporting, and regulatory requirements. Let me know what specific information you need.",
      tools: ['Knowledge Base', 'Regulatory Database'],
      confidence: 0.87,
      sources: ['Compliance Manual', 'Regulatory Guidelines']
    }
  ]
};

// Mock tools available to the AI
const availableTools = [
  'RAG System',
  'Compliance Database', 
  'Risk Engine',
  'Regulatory Updates',
  'Case Management',
  'AML Monitoring System',
  'Transaction Analysis',
  'Customer Profiling',
  'Geographic Risk Assessment',
  'KYC Database',
  'Document Verification',
  'Identity Verification',
  'Risk Escalation',
  'Knowledge Base',
  'Regulatory Database'
];

// Mock function to generate AI response
const generateMockAIResponse = (input: string, context?: AIContext): AIResponse => {
  const lowerInput = input.toLowerCase();
  let responseCategory = 'general';
  
  // Determine response category based on input
  if (lowerInput.includes('aml') || lowerInput.includes('anti-money laundering') || lowerInput.includes('transaction')) {
    responseCategory = 'compliance';
  } else if (lowerInput.includes('kyc') || lowerInput.includes('know your customer') || lowerInput.includes('verification')) {
    responseCategory = 'kyc';
  }
  
  const responses = mockAIResponses[responseCategory as keyof typeof mockAIResponses];
  const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Generate random tools used (2-4 tools)
  const toolCount = Math.floor(Math.random() * 3) + 2;
  const shuffledTools = [...availableTools].sort(() => 0.5 - Math.random());
  const usedTools = shuffledTools.slice(0, toolCount);
  
  // Add some randomness to confidence and processing time
  const confidence = selectedResponse.confidence + (Math.random() * 0.1 - 0.05);
  const processingTime = 800 + Math.random() * 1200; // 800-2000ms
  
  return {
    message: {
      id: `ai-${Date.now()}`,
      content: selectedResponse.content,
      role: 'assistant',
      timestamp: new Date(),
      tools: usedTools,
      metadata: {
        confidence: Math.min(confidence, 1.0),
        sources: selectedResponse.sources,
        processingTime
      }
    },
    tools: usedTools,
    confidence: Math.min(confidence, 1.0),
    sources: selectedResponse.sources,
    processingTime
  };
};

// Real AI service function
const callRealAIService = async (input: string, context?: AIContext): Promise<AIResponse> => {
  try {
    console.log('🤖 Calling real AI service...');
    
    // Call Supabase Edge Function for AI processing
    const { data, error } = await supabase.functions.invoke('ai-agent', {
      body: {
        message: input,
        context: context || {},
        timestamp: new Date().toISOString()
      }
    });

    if (error) {
      console.error('❌ AI service error:', error);
      throw new Error(`AI service error: ${error.message}`);
    }

    console.log('✅ AI service response:', data);
    
    return {
      message: {
        id: data.messageId || `ai-${Date.now()}`,
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        tools: data.tools || [],
        metadata: {
          confidence: data.confidence || 0.8,
          sources: data.sources || [],
          processingTime: data.processingTime || 1000
        }
      },
      tools: data.tools || [],
      confidence: data.confidence || 0.8,
      sources: data.sources || [],
      processingTime: data.processingTime || 1000
    };
  } catch (error) {
    console.error('🚨 AI service call failed:', error);
    throw error;
  }
};

// Main AI Agent service
export class AIAgentService {
  private static instance: AIAgentService;
  private conversationHistory: AIMessage[] = [];

  private constructor() {}

  static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  async sendMessage(input: string, context?: AIContext): Promise<AIResponse> {
    console.log('🤖 AI Agent - Processing message:', { input, useMockData: config.features.useMockData });
    
    // Add user message to history
    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    this.conversationHistory.push(userMessage);

    try {
      let response: AIResponse;

      if (config.features.useMockData) {
        console.log('🎭 Using mock AI data');
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
        response = generateMockAIResponse(input, context);
      } else {
        console.log('🔗 Using real AI service');
        response = await callRealAIService(input, {
          ...context,
          conversationHistory: this.conversationHistory.slice(-10) // Last 10 messages for context
        });
      }

      // Add AI response to history
      this.conversationHistory.push(response.message);

      // Log the interaction
      console.log('✅ AI response generated:', {
        messageId: response.message.id,
        tools: response.tools,
        confidence: response.confidence,
        processingTime: response.processingTime
      });

      return response;
    } catch (error) {
      console.error('❌ AI Agent error:', error);
      
      // Fallback to mock response if real service fails
      if (!config.features.useMockData) {
        console.log('🔄 Falling back to mock response due to service error');
        return generateMockAIResponse(input, context);
      }
      
      throw error;
    }
  }

  getConversationHistory(): AIMessage[] {
    return [...this.conversationHistory];
  }

  clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  // Get available tools
  getAvailableTools(): string[] {
    return [...availableTools];
  }

  // Get mock responses for testing
  getMockResponses() {
    return mockAIResponses;
  }
}

// Export singleton instance
export const aiAgentService = AIAgentService.getInstance();
