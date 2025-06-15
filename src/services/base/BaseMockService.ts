
import { config } from '@/config/environment';

// Simulated API delay for realistic development experience
const MOCK_DELAY = 500; // milliseconds

export const simulateDelay = (ms: number = MOCK_DELAY): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export class BaseMockService {
  protected static shouldUseMockData(): boolean {
    return config.features.useMockData;
  }

  protected static async mockApiCall<T>(data: T, operation: string): Promise<T> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log(`🔧 Mock API call: ${operation}`);
    await simulateDelay();
    return data;
  }

  static isMockMode(): boolean {
    return this.shouldUseMockData();
  }

  static toggleMockMode(): void {
    console.log('Mock mode toggle requested - restart app with VITE_USE_MOCK_DATA environment variable');
  }
}
