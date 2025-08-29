
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string;
  author?: string;
  imageUrl?: string;
}

export interface RSSFeed {
  id: string;
  title: string;
  description: string;
  feedUrl: string;
  websiteUrl: string;
  organization: string;
  categories: string[];
  status: 'active' | 'inactive';
  lastUpdated: string;
}

export interface NewsFilters {
  searchTerm: string;
  category: string;
  source: string;
}

// New interfaces for organization-specific news configuration
export interface NewsSource {
  id: string;
  name: string;
  url: string;
  description: string;
  categories: string[];
  isActive: boolean;
  priority: number; // 1-10, higher = more important
  lastFetched?: string;
  errorCount: number;
  customerId: string; // Organization this source belongs to
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RSSFeedConfig {
  id: string;
  title: string;
  description: string;
  feedUrl: string;
  websiteUrl: string;
  categories: string[];
  isActive: boolean;
  priority: number; // 1-10, higher = more important
  refreshInterval: number; // minutes
  lastFetched?: string;
  errorCount: number;
  customerId: string; // Organization this feed belongs to
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsConfiguration {
  customerId: string;
  newsSources: NewsSource[];
  rssFeeds: RSSFeedConfig[];
  defaultCategories: string[];
  refreshInterval: number; // minutes
  maxArticlesPerSource: number;
  enableAutoRefresh: boolean;
  enableNotifications: boolean;
  lastUpdated: string;
}

export interface NewsSourceTemplate {
  id: string;
  name: string;
  url: string;
  description: string;
  categories: string[];
  type: 'news' | 'rss';
  isRecommended: boolean;
}

export interface NewsStats {
  totalSources: number;
  activeSources: number;
  totalArticles: number;
  articlesToday: number;
  lastRefresh: string;
  errorCount: number;
}
