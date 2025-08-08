
import { NewsItem, RSSFeed } from '@/types/news';
import { KYCUser, KYCVerification } from '@/types/kyc';
import { AMLTransaction } from '@/types/aml';
import { MockDataService } from './mockDataService';
import { RealDataService } from './realDataService';
import { config } from '@/config/environment';

/**
 * Unified Data Service that automatically routes to either Mock or Real data services
 * based on the configuration flags set by developers
 */
export class UnifiedDataService {
  private static get useMockData(): boolean {
    return config.features.useMockData;
  }

  private static logDataSource(operation: string): void {
    const source = this.useMockData ? 'Mock Data' : 'Real API/Database';
    const emoji = this.useMockData ? '🎭' : '🌐';
    console.log(`${emoji} ${operation} - Source: ${source}`);
  }

  // News and RSS Feeds
  static async getNewsItems(): Promise<NewsItem[]> {
    this.logDataSource('Fetching news items');
    
    if (this.useMockData) {
      return MockDataService.getNewsItems();
    } else {
      return RealDataService.getNewsItems();
    }
  }

  static async getRSSFeeds(): Promise<RSSFeed[]> {
    this.logDataSource('Fetching RSS feeds');
    
    if (this.useMockData) {
      return MockDataService.getRSSFeeds();
    } else {
      return RealDataService.getRSSFeeds();
    }
  }

  // KYC Users
  static async getKYCUsers(filters?: any): Promise<KYCUser[]> {
    this.logDataSource('Fetching KYC users');
    
    if (this.useMockData) {
      return MockDataService.getKYCUsers(filters);
    } else {
      return RealDataService.getKYCUsers(filters);
    }
  }

  static async getKYCVerifications(): Promise<KYCVerification[]> {
    this.logDataSource('Fetching KYC verifications');
    
    if (this.useMockData) {
      return MockDataService.getKYCVerifications();
    } else {
      return RealDataService.getKYCVerifications();
    }
  }

  // AML Transactions
  static async getAMLTransactions(filters?: any): Promise<AMLTransaction[]> {
    this.logDataSource('Fetching AML transactions');
    
    if (this.useMockData) {
      return MockDataService.getAMLTransactions(filters);
    } else {
      return RealDataService.getAMLTransactions(filters);
    }
  }

  // Unified User Data
  static async getUnifiedUserData(filters?: any): Promise<any> {
    this.logDataSource('Fetching unified user data');
    
    if (this.useMockData) {
      return MockDataService.getUnifiedUserData(filters);
    } else {
      return RealDataService.getUnifiedUserData(filters);
    }
  }

  // Configuration helpers
  static isMockMode(): boolean {
    return this.useMockData;
  }

  static isRealMode(): boolean {
    return !this.useMockData;
  }

  static getCurrentDataSource(): string {
    return this.useMockData ? 'Mock Data Service' : 'Real API/Database';
  }

  static async validateCurrentDataSource(): Promise<boolean> {
    if (this.useMockData) {
      MockDataService.validateData();
      return true;
    } else {
      return RealDataService.validateDataSources();
    }
  }
}

export default UnifiedDataService;
