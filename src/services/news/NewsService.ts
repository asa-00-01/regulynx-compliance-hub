
import { NewsItem, RSSFeed } from '@/types/news';
import { mockNewsItems } from '@/hooks/data/mockNewsItems';
import { mockRssFeeds } from '@/hooks/data/mockRSSFeeds';
import { BaseMockService, simulateDelay } from '../base/BaseMockService';

export class NewsService extends BaseMockService {
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
}
