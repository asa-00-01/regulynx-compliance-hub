
import { config } from '@/config/environment';
import { NewsItem, RSSFeed } from '@/types/news';
import { ComplianceCaseDetails } from '@/types/case';
import { KYCUser, KYCVerification } from '@/types/kyc';
import { AMLTransaction } from '@/types/aml';
import { mockNewsItems } from '@/hooks/data/mockNewsItems';
import { mockRssFeeds } from '@/hooks/data/mockRSSFeeds';
import { mockComplianceCases } from '@/mocks/casesData';
import { mockUsers, mockVerifications } from '@/components/kyc/mockKycData';
import { mockTransactions } from '@/components/aml/mockTransactionData';
import { unifiedMockData } from '@/mocks/centralizedMockData';

// Simulated API delay for realistic development experience
const MOCK_DELAY = 500; // milliseconds

const simulateDelay = (ms: number = MOCK_DELAY): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export class MockDataService {
  private static shouldUseMockData(): boolean {
    return config.features.useMockData;
  }

  // News and RSS Feeds
  static async getNewsItems(): Promise<NewsItem[]> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log('📰 Fetching mock news items...');
    await simulateDelay();
    return mockNewsItems;
  }

  static async getRSSFeeds(): Promise<RSSFeed[]> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log('📡 Fetching mock RSS feeds...');
    await simulateDelay();
    return mockRssFeeds;
  }

  // Compliance Cases
  static async getComplianceCases(filters?: any): Promise<ComplianceCaseDetails[]> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log('📋 Fetching mock compliance cases...', filters ? 'with filters' : '');
    await simulateDelay();
    
    let filteredCases = [...mockComplianceCases];
    
    // Apply filters if provided
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        filteredCases = filteredCases.filter(c => filters.status.includes(c.status));
      }
      
      if (filters.type && filters.type.length > 0) {
        filteredCases = filteredCases.filter(c => filters.type.includes(c.type));
      }
      
      if (filters.priority && filters.priority.length > 0) {
        filteredCases = filteredCases.filter(c => filters.priority.includes(c.priority));
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredCases = filteredCases.filter(c => 
          c.userName.toLowerCase().includes(term) || 
          c.description.toLowerCase().includes(term)
        );
      }
    }
    
    return filteredCases;
  }

  static async createComplianceCase(caseData: Partial<ComplianceCaseDetails>): Promise<ComplianceCaseDetails> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log('✨ Creating mock compliance case...', caseData);
    await simulateDelay();
    
    const newCase: ComplianceCaseDetails = {
      id: `case-${Date.now()}`,
      userId: caseData.userId || '',
      userName: caseData.userName || 'Unknown User',
      createdAt: new Date().toISOString(),
      createdBy: caseData.createdBy,
      updatedAt: new Date().toISOString(),
      type: caseData.type || 'kyc',
      status: 'open',
      riskScore: caseData.riskScore || 50,
      description: caseData.description || 'No description provided',
      assignedTo: caseData.assignedTo,
      assignedToName: caseData.assignedToName,
      priority: caseData.priority || 'medium',
      source: caseData.source || 'manual',
      relatedTransactions: caseData.relatedTransactions || [],
      relatedAlerts: caseData.relatedAlerts || [],
      documents: caseData.documents || [],
    };
    
    return newCase;
  }

  // KYC Users
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

  // AML Transactions
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

  // Unified User Data
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

  // Generic mock API simulator
  static async mockApiCall<T>(data: T, operation: string): Promise<T> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log(`🔧 Mock API call: ${operation}`);
    await simulateDelay();
    return data;
  }

  // Utility to check if mock mode is enabled
  static isMockMode(): boolean {
    return this.shouldUseMockData();
  }

  // Toggle mock mode (for development/testing purposes)
  static toggleMockMode(): void {
    // This would typically update environment or localStorage
    console.log('Mock mode toggle requested - restart app with VITE_USE_MOCK_DATA environment variable');
  }
}

export default MockDataService;
