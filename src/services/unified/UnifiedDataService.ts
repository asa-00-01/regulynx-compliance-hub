
import { unifiedMockData } from '@/mocks/centralizedMockData';
import { BaseMockService, simulateDelay } from '../base/BaseMockService';

export class UnifiedDataService extends BaseMockService {
  static async getUnifiedUserData(filters?: any): Promise<typeof unifiedMockData> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log('🔄 Fetching unified mock user data...', filters ? 'with filters' : '');
    await simulateDelay();
    
    let filteredData = [...unifiedMockData];
    
    // Apply filters if provided
    if (filters) {
      if (filters.riskLevel) {
        filteredData = filteredData.filter(u => {
          if (filters.riskLevel === 'low') return u.riskScore <= 30;
          if (filters.riskLevel === 'medium') return u.riskScore > 30 && u.riskScore <= 70;
          if (filters.riskLevel === 'high') return u.riskScore > 70;
          return true;
        });
      }
      
      if (filters.kycStatus && filters.kycStatus.length > 0) {
        filteredData = filteredData.filter(u => filters.kycStatus.includes(u.kycStatus));
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredData = filteredData.filter(u => 
          u.fullName.toLowerCase().includes(term) || 
          u.email.toLowerCase().includes(term)
        );
      }
    }
    
    return filteredData;
  }
}
