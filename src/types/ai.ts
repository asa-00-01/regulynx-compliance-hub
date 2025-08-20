export interface AIConfiguration {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  systemPrompt: string;
  availableTools: string[];
  responseCategories: {
    [key: string]: {
      name: string;
      description: string;
      responses: Array<{
        content: string;
        tools: string[];
        confidence: number;
        sources: string[];
      }>;
    };
  };
  settings: {
    maxTokens: number;
    temperature: number;
    model: string;
    enableMockMode: boolean;
    enableDatabaseLogging: boolean;
    enableConversationHistory: boolean;
    maxHistoryLength: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAISettings {
  customerId: string;
  defaultConfigurationId?: string;
  openaiApiKey?: string;
  customTools: string[];
  customCategories: string[];
  preferences: {
    language: string;
    expertise: 'beginner' | 'intermediate' | 'expert';
    focus: string[];
    responseStyle: 'concise' | 'detailed' | 'technical';
  };
  limits: {
    maxRequestsPerDay: number;
    maxTokensPerRequest: number;
    maxConversationLength: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AIInteraction {
  id: string;
  customerId: string;
  userId: string;
  configurationId: string;
  message: string;
  response: string;
  toolsUsed: string[];
  confidence: number;
  processingTime: number;
  sessionId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
