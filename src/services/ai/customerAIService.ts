import { supabase } from '@/integrations/supabase/client';
import { config } from '@/config/environment';
import { 
  AIConfiguration, 
  CustomerAISettings, 
  AIInteraction 
} from '@/types/ai';

export class CustomerAIService {
  private static instance: CustomerAIService;

  private constructor() {}

  static getInstance(): CustomerAIService {
    if (!CustomerAIService.instance) {
      CustomerAIService.instance = new CustomerAIService();
    }
    return CustomerAIService.instance;
  }

  // Get customer AI settings
  async getCustomerAISettings(customerId: string): Promise<CustomerAISettings | null> {
    try {
      // For now, return default settings since the database tables don't exist yet
      console.warn('⚠️ Database tables not available, using default AI settings');
      return this.getDefaultCustomerSettings(customerId);
    } catch (error) {
      console.error('Error in getCustomerAISettings:', error);
      // Return default settings as fallback
      return this.getDefaultCustomerSettings(customerId);
    }
  }

  // Get default customer settings when database tables don't exist
  private getDefaultCustomerSettings(customerId: string): CustomerAISettings {
    return {
      customerId,
      defaultConfigurationId: undefined,
      openaiApiKey: undefined,
      customTools: [],
      customCategories: [],
      preferences: {
        language: 'en',
        expertise: 'intermediate',
        focus: ['aml', 'kyc', 'sar'],
        responseStyle: 'detailed'
      },
      limits: {
        maxRequestsPerDay: 1000,
        maxTokensPerRequest: 1000,
        maxConversationLength: 50
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Get AI configuration for customer
  async getAIConfiguration(configurationId: string): Promise<AIConfiguration | null> {
    try {
      // For now, return null since the database tables don't exist yet
      console.warn('⚠️ Database tables not available, using default AI configuration');
      return null;
    } catch (error) {
      console.error('Error in getAIConfiguration:', error);
      return null;
    }
  }

  // Get default configuration for customer
  async getDefaultConfiguration(customerId: string): Promise<AIConfiguration | null> {
    try {
      // For now, return null since the database tables don't exist yet
      console.warn('⚠️ Database tables not available, using default AI configuration');
      return null;
    } catch (error) {
      console.error('Error in getDefaultConfiguration:', error);
      return null;
    }
  }

  // Create or update customer AI settings
  async updateCustomerAISettings(
    customerId: string, 
    settings: Partial<CustomerAISettings>
  ): Promise<boolean> {
    try {
      // For now, return true since the database tables don't exist yet
      console.warn('⚠️ Database tables not available, settings update skipped');
      return true;
    } catch (error) {
      console.error('Error in updateCustomerAISettings:', error);
      return false;
    }
  }

  // Create AI configuration
  async createAIConfiguration(
    customerId: string,
    configuration: Omit<AIConfiguration, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>
  ): Promise<string | null> {
    try {
      // For now, return a mock ID since the database tables don't exist yet
      console.warn('⚠️ Database tables not available, configuration creation skipped');
      return 'mock-config-id-' + Date.now();
    } catch (error) {
      console.error('Error in createAIConfiguration:', error);
      return null;
    }
  }

  // Update AI configuration
  async updateAIConfiguration(
    configurationId: string,
    updates: Partial<AIConfiguration>
  ): Promise<boolean> {
    try {
      // For now, return true since the database tables don't exist yet
      console.warn('⚠️ Database tables not available, configuration update skipped');
      return true;
    } catch (error) {
      console.error('Error in updateAIConfiguration:', error);
      return false;
    }
  }

  // Log AI interaction
  async logInteraction(interaction: Omit<AIInteraction, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      // For now, return true since the database tables don't exist yet
      console.warn('⚠️ Database tables not available, interaction logging skipped');
      return true;
    } catch (error) {
      console.error('Error in logInteraction:', error);
      return false;
    }
  }

  // Get customer's AI configurations
  async getCustomerConfigurations(customerId: string): Promise<AIConfiguration[]> {
    try {
      // For now, return empty array since the database tables don't exist yet
      console.warn('⚠️ Database tables not available, returning empty configurations');
      return [];
    } catch (error) {
      console.error('Error in getCustomerConfigurations:', error);
      return [];
    }
  }

  // Check customer AI usage limits
  async checkUsageLimits(customerId: string): Promise<{
    canUse: boolean;
    remainingRequests: number;
    limit: number;
  }> {
    try {
      // For now, return unlimited usage since the database tables don't exist yet
      console.warn('⚠️ Database tables not available, using unlimited usage limits');
      return {
        canUse: true,
        remainingRequests: 999999,
        limit: 1000000
      };
    } catch (error) {
      console.error('Error in checkUsageLimits:', error);
      return { canUse: false, remainingRequests: 0, limit: 0 };
    }
  }
}

export const customerAIService = CustomerAIService.getInstance();
