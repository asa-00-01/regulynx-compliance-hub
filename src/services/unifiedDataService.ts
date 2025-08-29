
import { NewsItem, RSSFeed } from '@/types/news';
import { KYCUser, KYCVerification } from '@/types/kyc';
import { AMLTransaction } from '@/types/aml';
import { Transaction } from '@/types/transaction';
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
      const mockItems = await MockDataService.getNewsItems();
      
      // Try to get configured news sources and generate news items from them
      try {
        const { NewsConfigurationService } = await import('./news/newsConfigurationService');
        const config = await NewsConfigurationService.getConfiguration();
        
        if (config?.newsSources && config.newsSources.length > 0) {
          // Generate news items from configured sources
          const configuredNewsItems: NewsItem[] = config.newsSources
            .filter(source => source.isActive)
            .map(source => ({
              id: `configured_${source.id}`,
              title: `Latest from ${source.name}`,
              description: source.description || `Recent updates from ${source.name}`,
              content: source.description || `Recent updates from ${source.name}`,
              url: source.url,
              source: source.name,
              category: source.categories[0] || 'general',
              publishedAt: source.lastFetched || new Date().toISOString(),
              author: 'System',
              imageUrl: undefined
            }));
          
          // Combine mock items with configured items, avoiding duplicates
          const existingIds = new Set(mockItems.map(item => item.id));
          const newConfiguredItems = configuredNewsItems.filter(item => !existingIds.has(item.id));
          
          console.log(`📰 Found ${newConfiguredItems.length} configured news sources to add to news items`);
          return [...mockItems, ...newConfiguredItems];
        }
      } catch (error) {
        console.log('Could not fetch configured news sources, using only mock items:', error);
      }
      
      return mockItems;
    } else {
      return RealDataService.getNewsItems();
    }
  }

  static async getRSSFeeds(): Promise<RSSFeed[]> {
    this.logDataSource('Fetching RSS feeds');
    
    if (this.useMockData) {
      // In mock mode, combine static mock feeds with configured feeds
      const mockFeeds = await MockDataService.getRSSFeeds();
      
      // Try to get configured feeds from the news configuration
      try {
        // Import the news configuration service dynamically to avoid circular dependencies
        const { NewsConfigurationService } = await import('./news/newsConfigurationService');
        const config = await NewsConfigurationService.getConfiguration();
        
        if (config?.rssFeeds && config.rssFeeds.length > 0) {
          // Convert configured RSS feeds to RSSFeed format
          const configuredFeeds: RSSFeed[] = config.rssFeeds.map(feed => ({
            id: feed.id,
            title: feed.title,
            description: feed.description,
            feedUrl: feed.feedUrl,
            websiteUrl: feed.websiteUrl,
            organization: 'Custom Feed',
            categories: feed.categories,
            lastUpdated: feed.lastFetched || new Date().toISOString(),
            status: feed.isActive ? 'active' : 'inactive',
            refreshInterval: feed.refreshInterval,
            errorCount: feed.errorCount,
            items: [] // Empty items array since we don't have actual feed content
          }));
          
          // Combine mock feeds with configured feeds, avoiding duplicates
          const existingIds = new Set(mockFeeds.map(f => f.id));
          const newConfiguredFeeds = configuredFeeds.filter(f => !existingIds.has(f.id));
          
          console.log(`📡 Found ${newConfiguredFeeds.length} configured RSS feeds to add to mock feeds`);
          return [...mockFeeds, ...newConfiguredFeeds];
        }
      } catch (error) {
        console.log('Could not fetch configured RSS feeds, using only mock feeds:', error);
      }
      
      return mockFeeds;
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

  // Regular Transactions
  static async getTransactions(filters?: any): Promise<Transaction[]> {
    this.logDataSource('Fetching transactions');
    
    if (this.useMockData) {
      // Import mock transaction data
      const { mockTransactionData } = await import('@/components/transactions/mockTransactionData');
      return mockTransactionData.transactions;
    } else {
      // Use the new TransactionService for real data
      const { TransactionService } = await import('./transactionService');
      return TransactionService.getTransactions(filters);
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
