
import { config } from '@/config/environment';

// Configuration constants
const DEFAULT_MOCK_DELAY = 500; // milliseconds
const MAX_RISK_SCORE = 100;

/**
 * Simulates API delay for realistic development experience
 */
export const simulateDelay = (delayInMilliseconds: number = DEFAULT_MOCK_DELAY): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, delayInMilliseconds));
};

/**
 * Abstract base class for all mock services providing common functionality
 * for data operations, logging, and configuration management.
 */
export abstract class BaseMockService {
  // Static configuration methods
  
  /**
   * Determines if mock data should be used based on configuration
   */
  public static shouldUseMockData(): boolean {
    return config.features.useMockData;
  }

  /**
   * Checks if the service is currently in mock mode
   */
  static isMockMode(): boolean {
    return this.shouldUseMockData();
  }

  /**
   * Provides instruction for toggling mock mode (requires restart)
   */
  static toggleMockMode(): void {
    console.log('Mock mode toggle requested - restart app with VITE_USE_MOCK_DATA environment variable');
  }

  // Protected utility methods

  /**
   * Logs data operations with appropriate emoji and formatting
   */
  protected static logDataOperation(operationType: string, entityTypeName: string, itemCount?: number): void {
    const operationEmoji = this.getOperationEmoji(operationType);
    const itemCountText = itemCount !== undefined ? ` (${itemCount} items)` : '';
    console.log(`${operationEmoji} ${operationType} ${entityTypeName}${itemCountText} from mock service`);
  }

  /**
   * Returns appropriate emoji for different operation types
   */
  private static getOperationEmoji(operationType: string): string {
    const emojiMappings: Record<string, string> = {
      'Fetching': '📊',
      'Creating': '✨',
      'Updating': '🔄',
      'Deleting': '🗑️',
      'Validating': '🔍',
      'Loading': '⏳'
    };
    return emojiMappings[operationType] || '📝';
  }

  /**
   * Performs mock API call with logging and delay simulation
   */
  protected static async mockApiCall<T>(
    mockData: T, 
    operationType: string, 
    entityTypeName: string = 'data'
  ): Promise<T> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }

    const dataItemCount = Array.isArray(mockData) ? mockData.length : undefined;
    this.logDataOperation(operationType, entityTypeName, dataItemCount);
    
    await simulateDelay();
    return mockData;
  }
}
