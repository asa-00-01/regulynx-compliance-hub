
import { AMLTransaction } from '@/types/aml';
import { mockTransactions } from '@/components/aml/mockTransactionData';
import { BaseMockService, simulateDelay } from '../base/BaseMockService';

export class AMLService extends BaseMockService {
  static async getAMLTransactions(filters?: any): Promise<AMLTransaction[]> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log('💰 Fetching mock AML transactions...', filters ? 'with filters' : '');
    await simulateDelay();
    
    let filteredTransactions = [...mockTransactions];
    
    // Apply filters if provided
    if (filters) {
      if (filters.riskLevel) {
        filteredTransactions = filteredTransactions.filter(t => {
          if (filters.riskLevel === 'low') return t.riskScore <= 30;
          if (filters.riskLevel === 'medium') return t.riskScore > 30 && t.riskScore <= 70;
          if (filters.riskLevel === 'high') return t.riskScore > 70;
          return true;
        });
      }
      
      if (filters.status) {
        filteredTransactions = filteredTransactions.filter(t => t.status === filters.status);
      }
      
      if (filters.dateRange) {
        // Apply date range filtering logic here
        const now = new Date();
        const cutoffDate = new Date();
        
        switch (filters.dateRange) {
          case '7days':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case '30days':
            cutoffDate.setDate(now.getDate() - 30);
            break;
          case '90days':
            cutoffDate.setDate(now.getDate() - 90);
            break;
        }
        
        filteredTransactions = filteredTransactions.filter(t => 
          new Date(t.timestamp) >= cutoffDate
        );
      }
    }
    
    return filteredTransactions;
  }
}
