
import { KYCUser, KYCVerification } from '@/types/kyc';
import { mockUsers, mockVerifications } from '@/components/kyc/mockKycData';
import { BaseMockService, simulateDelay } from '../base/BaseMockService';

export class KYCService extends BaseMockService {
  static async getKYCUsers(filters?: any): Promise<KYCUser[]> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log('👤 Fetching mock KYC users...', filters ? 'with filters' : '');
    await simulateDelay();
    
    let filteredUsers = [...mockUsers];
    
    // Apply filters if provided
    if (filters) {
      if (filters.kycStatus && filters.kycStatus.length > 0) {
        // Note: mockUsers doesn't have kycStatus directly, would need to join with verifications
        // For now, return all users
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
          u.fullName.toLowerCase().includes(term) || 
          u.email.toLowerCase().includes(term)
        );
      }
    }
    
    return filteredUsers;
  }

  static async getKYCVerifications(): Promise<KYCVerification[]> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log('✅ Fetching mock KYC verifications...');
    await simulateDelay();
    return mockVerifications;
  }
}
