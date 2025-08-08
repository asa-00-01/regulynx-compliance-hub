
import { KYCUser, KYCVerification } from '@/types/kyc';
import { BaseMockService, simulateDelay } from '../base/BaseMockService';

export class KYCService extends BaseMockService {
  static async getKYCUsers(filters?: any): Promise<KYCUser[]> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log('👤 KYC Service: Use compliance context for consistent data instead of this service');
    console.log('👤 This service is deprecated - use useCompliance hook to get centralized user data');
    await simulateDelay();
    
    // Return empty array to encourage use of compliance context
    return [];
  }

  static async getKYCVerifications(): Promise<KYCVerification[]> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log('✅ KYC Service: Use compliance context for consistent data instead of this service');
    await simulateDelay();
    
    // Return empty array to encourage use of compliance context
    return [];
  }
}
