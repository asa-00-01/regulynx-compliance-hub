
import { NewsItem, RSSFeed } from '@/types/news';
import { KYCUser, KYCVerification } from '@/types/kyc';
import { AMLTransaction } from '@/types/aml';
import { unifiedMockData } from '@/mocks/centralizedMockData';

import { NewsService } from './news/NewsService';
import { KYCService } from './kyc/KYCService';
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

  // KYC Users
  static async getKYCUsers(filters?: any): Promise<KYCUser[]> {
    return KYCService.getKYCUsers(filters);
  }

  static async getKYCVerifications(): Promise<KYCVerification[]> {
    return KYCService.getKYCVerifications();
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
    logValidationResults();
  }

  static shouldUseMockData(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  static isMockMode(): boolean {
    return this.shouldUseMockData();
  }
}

// Auto-validate data in development
if (MockDataService.shouldUseMockData()) {
  MockDataService.validateData();
}

export default MockDataService;
