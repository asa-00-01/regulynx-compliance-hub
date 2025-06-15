
import { useState, useEffect } from 'react';
import { NewsItem, RSSFeed } from '@/types/news';
import { handleAPIError, withRetry } from '@/lib/api';
import { MockDataService } from '@/services/mockDataService';
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
      
      if (config.features.useMockData) {
        // Use mock data service
        console.log('📰 Loading news data from mock service...');
        const [mockNews, mockFeeds] = await Promise.all([
          MockDataService.getNewsItems(),
          MockDataService.getRSSFeeds()
        ]);
        
        setNewsItems(mockNews);
        setRssFeeds(mockFeeds);
      } else {
        // Use real API with retry logic
        await withRetry(async () => {
          // In production, this would be actual API calls
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // This would be replaced with real API calls
          const [mockNews, mockFeeds] = await Promise.all([
            MockDataService.getNewsItems(),
            MockDataService.getRSSFeeds()
          ]);
          
          setNewsItems(mockNews);
          setRssFeeds(mockFeeds);
        }, 3, 1000);
      }
      
    } catch (err) {
      const error = handleAPIError(err, 'loading news data');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewsData();
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
  };
};
