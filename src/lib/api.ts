
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import config from '@/config/environment';

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: any, context?: string) => {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
  
  let message = 'An unexpected error occurred';
  
  if (error?.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  // Don't show toast for authentication errors
  if (error?.status !== 401) {
    toast.error(message);
  }
  
  return new APIError(message, error?.status, error?.code);
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError!;
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1).single();
    return !error;
  } catch {
    return false;
  }
};

export default {
  handleAPIError,
  withRetry,
  checkHealth,
  APIError
};
