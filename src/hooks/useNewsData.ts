
import { useState, useEffect } from 'react';
import { NewsItem, RSSFeed } from '@/types/news';
import { handleAPIError, withRetry } from '@/lib/api';
import { mockNewsItems } from './data/mockNewsItems';
import { mockRssFeeds } from './data/mockRSSFeeds';

export const useNewsData = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [rssFeeds, setRssFeeds] = useState<RSSFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNewsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call with retry logic
      await withRetry(async () => {
        // In production, this would be actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setNewsItems(mockNewsItems);
        setRssFeeds(mockRssFeeds);
      }, 3, 1000);
      
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
  };
};
