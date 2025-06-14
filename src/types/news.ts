
export interface NewsItem {
  id: string;
  title: string;
  description: string;
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
