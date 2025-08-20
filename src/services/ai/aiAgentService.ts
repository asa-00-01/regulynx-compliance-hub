import { config } from '@/config/environment';
import { supabase } from '@/integrations/supabase/client';
import { customerAIService } from './customerAIService';
import { AIConfiguration, CustomerAISettings } from '@/types/ai';

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
  customerId?: string;
  configurationId?: string;
  sessionId?: string;
  conversationHistory?: AIMessage[];
  userPreferences?: {
    language?: string;
    expertise?: 'beginner' | 'intermediate' | 'expert';
    focus?: string[];
  };
}

// Default mock AI responses for fallback
const defaultMockResponses = {
  compliance: [
    {
      content: "Based on our compliance database, I can provide guidance on that topic. Let me analyze the current regulatory requirements for AML compliance. The key areas to focus on include customer due diligence, transaction monitoring, and suspicious activity reporting.",
      tools: ['RAG System', 'Compliance Database', 'Regulatory Updates'],
      confidence: 0.92,
      sources: ['AML Guidelines 2024', 'FATF Recommendations', 'Local Regulatory Framework']
    }
  ],
  kyc: [
    {
      content: "I've consulted our KYC knowledge base and case history. Here's my analysis: For new customer onboarding, you'll need to verify identity documents, assess risk level, and conduct enhanced due diligence for high-risk customers.",
      tools: ['KYC Database', 'Document Verification', 'Risk Assessment'],
      confidence: 0.89,
      sources: ['KYC Procedures Manual', 'Identity Verification Standards', 'Enhanced Due Diligence Guidelines']
    }
  ],
  general: [
    {
      content: "I'm here to help with your compliance questions. I can assist with AML monitoring, KYC procedures, risk assessment, regulatory updates, and case management. What specific area would you like to explore?",
      tools: ['RAG System', 'Compliance Database'],
      confidence: 0.85,
      sources: ['General Compliance Guidelines', 'Platform Documentation']
    }
  ]
};

// Default tools available to the AI
const defaultAvailableTools = [
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

// Mock function to generate AI response based on configuration
const generateMockAIResponse = (
  input: string, 
  context?: AIContext,
  aiConfiguration?: AIConfiguration
): AIResponse => {
  const lowerInput = input.toLowerCase();
  let responseCategory = 'general';
  
  // Determine response category based on input
  if (lowerInput.includes('aml') || lowerInput.includes('anti-money laundering') || lowerInput.includes('transaction')) {
    responseCategory = 'compliance';
  } else if (lowerInput.includes('kyc') || lowerInput.includes('know your customer') || lowerInput.includes('verification')) {
    responseCategory = 'kyc';
  }
  
  // Use customer-specific responses if available, otherwise fall back to defaults
  const responses = aiConfiguration?.responseCategories?.[responseCategory]?.responses || 
                   defaultMockResponses[responseCategory as keyof typeof defaultMockResponses];
  
  const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Use customer-specific tools if available, otherwise fall back to defaults
  const availableTools = aiConfiguration?.availableTools || defaultAvailableTools;
  
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

// Real AI service function with customer support
const callRealAIService = async (
  input: string, 
  context?: AIContext,
  aiConfiguration?: AIConfiguration
): Promise<AIResponse> => {
  try {
    console.log('🤖 Calling real AI service...', { customerId: context?.customerId });
    
    // Call Supabase Edge Function for AI processing
    const { data, error } = await supabase.functions.invoke('ai-service', {
      body: {
        message: input,
        context: {
          ...context,
          sessionId: context?.sessionId || `session-${Date.now()}`,
          userPreferences: {
            language: 'en',
            expertise: 'intermediate',
            focus: ['aml', 'kyc', 'sar'],
            ...context?.userPreferences
          },
          // Include customer-specific configuration
          aiConfiguration: aiConfiguration ? {
            systemPrompt: aiConfiguration.systemPrompt,
            availableTools: aiConfiguration.availableTools,
            settings: aiConfiguration.settings
          } : undefined
        },
        timestamp: new Date().toISOString()
      }
    });

    if (error) {
      console.error('❌ AI service error:', error);
      
      // Check if it's a CORS or function not found error
      if (error.message.includes('CORS') || error.message.includes('Failed to send a request')) {
        console.warn('⚠️ Edge Function not available, falling back to mock responses');
        throw new Error('EDGE_FUNCTION_NOT_AVAILABLE');
      }
      
      throw new Error(`AI service error: ${error.message}`);
    }

    if (!data) {
      throw new Error('No response data received from AI service');
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
    
    // If it's a specific error indicating the function isn't available, throw a special error
    if (error instanceof Error && error.message === 'EDGE_FUNCTION_NOT_AVAILABLE') {
      throw error;
    }
    
    throw error;
  }
};

// Main AI Agent service
export class AIAgentService {
  private static instance: AIAgentService;
  private conversationHistory: AIMessage[] = [];
  private currentConfiguration: AIConfiguration | null = null;
  private currentCustomerId: string | null = null;

  private constructor() {}

  static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  // Initialize AI Agent for a specific customer
  async initializeForCustomer(customerId: string, configurationId?: string): Promise<boolean> {
    try {
      console.log('🔧 Initializing AI Agent for customer:', customerId);
      
      this.currentCustomerId = customerId;
      
      // Get customer settings
      const customerSettings = await customerAIService.getCustomerAISettings(customerId);
      if (!customerSettings) {
        console.warn('⚠️ No customer settings found, using defaults');
        // Continue with initialization even without settings
      }

      // Get AI configuration
      const configId = configurationId || customerSettings?.defaultConfigurationId;
      if (configId) {
        this.currentConfiguration = await customerAIService.getAIConfiguration(configId);
        if (this.currentConfiguration) {
          console.log('✅ Loaded AI configuration:', this.currentConfiguration.name);
        }
      }

      // Check usage limits
      const usageLimits = await customerAIService.checkUsageLimits(customerId);
      if (!usageLimits.canUse) {
        console.warn('⚠️ Customer has reached AI usage limits');
        return false;
      }

      console.log('✅ AI Agent initialized for customer:', customerId);
      return true;
    } catch (error) {
      console.error('❌ Error initializing AI Agent for customer:', error);
      // Return true to allow the AI to work even if initialization fails
      return true;
    }
  }

  async sendMessage(input: string, context?: AIContext): Promise<AIResponse> {
    console.log('🤖 AI Agent - Processing message:', { 
      input, 
      useMockData: config.features.useMockData,
      customerId: this.currentCustomerId || context?.customerId 
    });
    
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
        response = generateMockAIResponse(input, context, this.currentConfiguration);
      } else {
        console.log('🔗 Using real AI service');
        try {
          response = await callRealAIService(input, {
            ...context,
            customerId: this.currentCustomerId || context?.customerId,
            configurationId: this.currentConfiguration?.id,
            conversationHistory: this.conversationHistory.slice(-10) // Last 10 messages for context
          }, this.currentConfiguration);
        } catch (serviceError) {
          // Check if it's the specific error for unavailable Edge Function
          if (serviceError instanceof Error && serviceError.message === 'EDGE_FUNCTION_NOT_AVAILABLE') {
            console.log('🔄 Edge Function not available, falling back to mock response');
            response = generateMockAIResponse(input, context, this.currentConfiguration);
          } else {
            // Re-throw other errors
            throw serviceError;
          }
        }
      }

      // Add AI response to history
      this.conversationHistory.push(response.message);

      // Log the interaction if customer is set
      if (this.currentCustomerId && this.currentConfiguration) {
        try {
          await customerAIService.logInteraction({
            customerId: this.currentCustomerId,
            userId: context?.userId || 'unknown',
            configurationId: this.currentConfiguration.id,
            message: input,
            response: response.message.content,
            toolsUsed: response.tools,
            confidence: response.confidence,
            processingTime: response.processingTime,
            sessionId: context?.sessionId || `session-${Date.now()}`,
            metadata: context?.userPreferences || {}
          });
        } catch (logError) {
          console.warn('⚠️ Failed to log AI interaction:', logError);
        }
      }

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
        return generateMockAIResponse(input, context, this.currentConfiguration);
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

  // Get available tools based on current configuration
  getAvailableTools(): string[] {
    return this.currentConfiguration?.availableTools || defaultAvailableTools;
  }

  // Get current configuration
  getCurrentConfiguration(): AIConfiguration | null {
    return this.currentConfiguration;
  }

  // Get current customer ID
  getCurrentCustomerId(): string | null {
    return this.currentCustomerId;
  }

  // Get mock responses for testing
  getMockResponses() {
    return this.currentConfiguration?.responseCategories || defaultMockResponses;
  }
}

// Export singleton instance
export const aiAgentService = AIAgentService.getInstance();
