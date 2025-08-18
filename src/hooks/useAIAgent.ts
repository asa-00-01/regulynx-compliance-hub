import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { aiAgentService, AIMessage, AIResponse, AIContext } from '@/services/ai/aiAgentService';
import { toast } from 'sonner';
import { config } from '@/config/environment';

export interface UseAIAgentReturn {
  messages: AIMessage[];
  isLoading: boolean;
  sendMessage: (input: string) => Promise<void>;
  clearConversation: () => void;
  conversationHistory: AIMessage[];
  availableTools: string[];
  isMockMode: boolean;
  lastResponse?: AIResponse;
}

export const useAIAgent = (): UseAIAgentReturn => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AIResponse | undefined>();
  const abortControllerRef = useRef<AbortController | null>(null);

  const isMockMode = config.features.useMockData;

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create context with user information
      const context: AIContext = {
        userId: user?.id,
        sessionId: `session-${Date.now()}`,
        userPreferences: {
          language: 'en',
          expertise: 'intermediate',
          focus: ['compliance', 'aml', 'kyc']
        }
      };

      console.log('🤖 Sending message to AI Agent:', { input, context, isMockMode });

      const response = await aiAgentService.sendMessage(input, context);

      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🚫 AI request was cancelled');
        return;
      }

      setMessages(prev => [...prev, response.message]);
      setLastResponse(response);

      console.log('✅ AI response received:', {
        messageId: response.message.id,
        tools: response.tools,
        confidence: response.confidence,
        processingTime: response.processingTime
      });

      // Show toast for low confidence responses
      if (response.confidence < 0.7) {
        toast.warning('AI response confidence is low. Please verify the information.', {
          description: `Confidence: ${(response.confidence * 100).toFixed(1)}%`
        });
      }

    } catch (error) {
      console.error('❌ AI Agent error:', error);
      
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🚫 AI request was cancelled');
        return;
      }

      // Add error message to conversation
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        content: "I'm sorry, I encountered an error while processing your request. Please try again or contact support if the issue persists.",
        role: 'assistant',
        timestamp: new Date(),
        tools: [],
        metadata: {
          confidence: 0,
          sources: [],
          processingTime: 0
        }
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast.error('Failed to get AI response', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading, user?.id, isMockMode]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setLastResponse(undefined);
    aiAgentService.clearConversationHistory();
    console.log('🧹 AI conversation cleared');
  }, []);

  const conversationHistory = aiAgentService.getConversationHistory();
  const availableTools = aiAgentService.getAvailableTools();

  return {
    messages,
    isLoading,
    sendMessage,
    clearConversation,
    conversationHistory,
    availableTools,
    isMockMode,
    lastResponse
  };
};
