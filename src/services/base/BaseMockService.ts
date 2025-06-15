
import { config } from '@/config/environment';

// Simulated API delay for realistic development experience
const MOCK_DELAY = 500; // milliseconds

export const simulateDelay = (ms: number = MOCK_DELAY): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export abstract class BaseMockService {
  public static shouldUseMockData(): boolean {
    return config.features.useMockData;
  }

  protected static logDataOperation(operation: string, entityType: string, count?: number): void {
    const emoji = this.getOperationEmoji(operation);
    const countText = count !== undefined ? ` (${count} items)` : '';
    console.log(`${emoji} ${operation} ${entityType}${countText} from mock service`);
  }

  private static getOperationEmoji(operation: string): string {
    const emojiMap: Record<string, string> = {
      'Fetching': '📊',
      'Creating': '✨',
      'Updating': '🔄',
      'Deleting': '🗑️',
      'Validating': '🔍',
      'Loading': '⏳'
    };
    return emojiMap[operation] || '📝';
  }

  protected static async mockApiCall<T>(data: T, operation: string, entityType: string = 'data'): Promise<T> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }

    const count = Array.isArray(data) ? data.length : undefined;
    this.logDataOperation(operation, entityType, count);
    
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
