
import { useState, useEffect } from 'react';
import { NewsItem, RSSFeed } from '@/types/news';
import { handleAPIError, withRetry } from '@/lib/api';
import { UnifiedDataService } from '@/services/unifiedDataService';
import { config } from '@/config/environment';

export const useNewsData = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [rssFeeds, setRssFeeds] = useState<RSSFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNewsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📰 Loading news data via ${UnifiedDataService.getCurrentDataSource()}...`);
      
      // Use the unified service that automatically chooses between mock and real data
      const [newsData, feedsData] = await Promise.all([
        UnifiedDataService.getNewsItems(),
        UnifiedDataService.getRSSFeeds()
      ]);
      
      setNewsItems(newsData);
      setRssFeeds(feedsData);
      
    } catch (err) {
      const error = handleAPIError(err, 'loading news data');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewsData();
  }, [config.features.useMockData]); // Re-load when mock mode changes

  // Listen for configuration changes to refresh RSS feeds
  useEffect(() => {
    const handleConfigurationChange = () => {
      // Refresh news data when configuration changes, regardless of mock mode
      console.log('🔄 News configuration changed, refreshing news data...');
      loadNewsData();
    };

    // Listen for custom events when configuration changes
    window.addEventListener('news-configuration-changed', handleConfigurationChange);
    
    return () => {
      window.removeEventListener('news-configuration-changed', handleConfigurationChange);
    };
  }, []);

  const refetch = async () => {
    setError(null);
    await loadNewsData();
  };

  return {
    newsItems,
    rssFeeds,
    loading,
    error,
    refetch,
    isMockMode: config.features.useMockData,
    dataSource: UnifiedDataService.getCurrentDataSource(),
  };
};
