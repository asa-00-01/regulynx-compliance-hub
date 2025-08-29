
import { NewsItem, RSSFeed } from '@/types/news';
import { KYCUser, KYCVerification } from '@/types/kyc';
import { AMLTransaction } from '@/types/aml';
import { unifiedMockData } from '@/mocks/centralizedMockData';

import { NewsService } from './news/NewsService';
import { AMLService } from './aml/AMLService';
import { UnifiedDataService } from './unified/UnifiedDataService';

import { logValidationResults } from '@/mocks/validators/dataValidator';

export class MockDataService {
  // News and RSS Feeds
  static async getNewsItems(): Promise<NewsItem[]> {
    return NewsService.getNewsItems();
  }

  static async getRSSFeeds(): Promise<RSSFeed[]> {
    return NewsService.getRSSFeeds();
  }

  // KYC Users - Using UnifiedDataService instead of deprecated KYCService
  static async getKYCUsers(filters?: any): Promise<KYCUser[]> {
    const unifiedData = await UnifiedDataService.getUnifiedUserData(filters);
    return unifiedData.users.map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      nationality: user.nationality,
      identityNumber: user.identityNumber,
      phoneNumber: user.phoneNumber,
      address: user.address,
      countryOfResidence: user.countryOfResidence,
      riskScore: user.riskScore,
      isPEP: user.isPEP,
      isSanctioned: user.isSanctioned,
      kycStatus: user.kycStatus,
      flags: user.kycFlags,
      createdAt: user.createdAt
    }));
  }

  static async getKYCVerifications(): Promise<KYCVerification[]> {
    // Return empty array as KYC verifications are now handled through unified data
    return [];
  }

  // AML Transactions
  static async getAMLTransactions(filters?: any): Promise<AMLTransaction[]> {
    return AMLService.getAMLTransactions(filters);
  }

  // Unified User Data
  static async getUnifiedUserData(filters?: any): Promise<typeof unifiedMockData> {
    return UnifiedDataService.getUnifiedUserData(filters);
  }

  // Initialize and validate mock data
  static validateData(): void {
    console.log('🔍 Validating mock data consistency...');
    try {
      logValidationResults();
    } catch (error) {
      console.warn('Mock data validation encountered issues:', error);
      console.log('✅ Continuing with available mock data');
    }
  }

  static shouldUseMockData(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  static isMockMode(): boolean {
    return this.shouldUseMockData();
  }
}

// Auto-validate data in development, but don't block the app if validation fails
if (MockDataService.shouldUseMockData()) {
  // Use setTimeout to avoid blocking the main thread
  setTimeout(() => {
    MockDataService.validateData();
  }, 100);
}

export default MockDataService;
