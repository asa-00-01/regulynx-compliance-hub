import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  NewsConfiguration, 
  NewsSource, 
  RSSFeedConfig, 
  NewsSourceTemplate,
  NewsStats 
} from '@/types/news';
import { config, getConfig } from '@/config/environment';
import { useToast } from '@/hooks/use-toast';
import { NewsConfigurationService } from '@/services/news/newsConfigurationService';

// Mock data for news source templates
const mockNewsSourceTemplates: NewsSourceTemplate[] = [
  {
    id: 'template_001',
    name: 'FATF News',
    url: 'https://fatf-gafi.org/news',
    description: 'Financial Action Task Force news and updates',
    categories: ['regulation', 'aml', 'sanctions'],
    type: 'news',
    isRecommended: true
  },
  {
    id: 'template_002',
    name: 'EU Financial Regulation',
    url: 'https://europa.eu/financial-regulation',
    description: 'European Union financial regulation updates',
    categories: ['regulation', 'compliance', 'eu-regulation'],
    type: 'news',
    isRecommended: true
  },
  {
    id: 'template_003',
    name: 'OFAC Sanctions',
    url: 'https://treasury.gov/ofac',
    description: 'Office of Foreign Assets Control sanctions updates',
    categories: ['sanctions', 'regulation'],
    type: 'news',
    isRecommended: true
  },
  {
    id: 'template_004',
    name: 'AML Compliance News',
    url: 'https://amlcompliance.com',
    description: 'Anti-money laundering compliance news',
    categories: ['aml', 'compliance', 'best-practices'],
    type: 'news',
    isRecommended: false
  },
  {
    id: 'template_005',
    name: 'FATF RSS Feed',
    url: 'https://fatf-gafi.org/rss',
    description: 'FATF RSS feed for automated updates',
    categories: ['regulation', 'aml', 'sanctions'],
    type: 'rss',
    isRecommended: true
  },
  {
    id: 'template_006',
    name: 'EU Regulation RSS',
    url: 'https://europa.eu/financial-regulation/rss',
    description: 'EU financial regulation RSS feed',
    categories: ['regulation', 'compliance', 'eu-regulation'],
    type: 'rss',
    isRecommended: true
  }
];

// Mock organization configuration
const mockOrganizationConfig: NewsConfiguration = {
  customerId: 'customer_001',
  newsSources: [
    {
      id: 'source_001',
      name: 'FATF News',
      url: 'https://fatf-gafi.org/news',
      description: 'Financial Action Task Force news and updates',
      categories: ['regulation', 'aml', 'sanctions'],
      isActive: true,
      priority: 9,
      lastFetched: new Date().toISOString(),
      errorCount: 0,
      customerId: 'customer_001',
      createdBy: 'admin_001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'source_002',
      name: 'EU Financial Regulation',
      url: 'https://europa.eu/financial-regulation',
      description: 'European Union financial regulation updates',
      categories: ['regulation', 'compliance', 'eu-regulation'],
      isActive: true,
      priority: 8,
      lastFetched: new Date().toISOString(),
      errorCount: 0,
      customerId: 'customer_001',
      createdBy: 'admin_001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  rssFeeds: [
    {
      id: 'rss_001',
      title: 'FATF RSS Feed',
      description: 'FATF RSS feed for automated updates',
      feedUrl: 'https://fatf-gafi.org/rss',
      websiteUrl: 'https://fatf-gafi.org',
      categories: ['regulation', 'aml', 'sanctions'],
      isActive: true,
      priority: 9,
      refreshInterval: 60,
      lastFetched: new Date().toISOString(),
      errorCount: 0,
      customerId: 'customer_001',
      createdBy: 'admin_001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  defaultCategories: ['regulation', 'aml', 'sanctions', 'compliance'],
  refreshInterval: 60,
  maxArticlesPerSource: 50,
  enableAutoRefresh: true,
  enableNotifications: true,
  lastUpdated: new Date().toISOString()
};

export function useNewsConfiguration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [configuration, setConfiguration] = useState<NewsConfiguration | null>(null);
  const [templates, setTemplates] = useState<NewsSourceTemplate[]>([]);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Check if user has admin permissions
  const isAdmin = user?.customer_roles?.includes('customer_admin') || 
                  user?.platform_roles?.includes('platform_admin') ||
                  user?.role === 'admin';

  // Load configuration
  const loadConfiguration = useCallback(async () => {
    setLoading(true);
    try {
      if (getConfig().features.useMockData) {
        console.log('🎭 Loading mock news configuration');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setConfiguration(mockOrganizationConfig);
        setTemplates(mockNewsSourceTemplates);
        setStats({
          totalSources: mockOrganizationConfig.newsSources.length + mockOrganizationConfig.rssFeeds.length,
          activeSources: mockOrganizationConfig.newsSources.filter(s => s.isActive).length + 
                        mockOrganizationConfig.rssFeeds.filter(f => f.isActive).length,
          totalArticles: 156,
          articlesToday: 12,
          lastRefresh: new Date().toISOString(),
          errorCount: 0
        });
      } else {
        console.log('🌐 Loading real news configuration from database');
        const [configData, templatesData, statsData] = await Promise.all([
          NewsConfigurationService.getConfiguration(),
          NewsConfigurationService.getTemplates(),
          NewsConfigurationService.getStats()
        ]);
        
        setConfiguration(configData);
        setTemplates(templatesData);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading news configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to load news configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Add news source
  const addNewsSource = useCallback(async (source: Omit<NewsSource, 'id' | 'customerId' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can configure news sources',
        variant: 'destructive'
      });
      return false;
    }

    setSaving(true);
    try {
      const newSource: NewsSource = {
        ...source,
        id: `source_${Date.now()}`,
        customerId: user?.customer_id || 'unknown',
        createdBy: user?.id || 'unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (getConfig().features.useMockData) {
        setConfiguration(prev => prev ? {
          ...prev,
          newsSources: [...prev.newsSources, newSource],
          lastUpdated: new Date().toISOString()
        } : null);
        
        // Dispatch event to notify news data hook to refresh
        window.dispatchEvent(new CustomEvent('news-configuration-changed'));
        
        toast({
          title: 'Success',
          description: 'News source added successfully'
        });
        return true;
      } else {
        // Real API call
        const addedSource = await NewsConfigurationService.addNewsSource(source);
        setConfiguration(prev => prev ? {
          ...prev,
          newsSources: [...prev.newsSources, addedSource],
          lastUpdated: new Date().toISOString()
        } : null);
        
        // Dispatch event to notify news data hook to refresh
        window.dispatchEvent(new CustomEvent('news-configuration-changed'));
        
        toast({
          title: 'Success',
          description: 'News source added successfully'
        });
        return true;
      }
    } catch (error) {
      console.error('Error adding news source:', error);
      toast({
        title: 'Error',
        description: 'Failed to add news source',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [isAdmin, user, toast]);

  // Add RSS feed
  const addRSSFeed = useCallback(async (feed: Omit<RSSFeedConfig, 'id' | 'customerId' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can configure RSS feeds',
        variant: 'destructive'
      });
      return false;
    }

    setSaving(true);
    try {
      const newFeed: RSSFeedConfig = {
        ...feed,
        id: `rss_${Date.now()}`,
        customerId: user?.customer_id || 'unknown',
        createdBy: user?.id || 'unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (getConfig().features.useMockData) {
        setConfiguration(prev => prev ? {
          ...prev,
          rssFeeds: [...prev.rssFeeds, newFeed],
          lastUpdated: new Date().toISOString()
        } : null);
        
        // Dispatch event to notify news data hook to refresh
        window.dispatchEvent(new CustomEvent('news-configuration-changed'));
        
        toast({
          title: 'Success',
          description: 'RSS feed added successfully'
        });
        return true;
      } else {
        // Real API call
        const addedFeed = await NewsConfigurationService.addRSSFeed(feed);
        setConfiguration(prev => prev ? {
          ...prev,
          rssFeeds: [...prev.rssFeeds, addedFeed],
          lastUpdated: new Date().toISOString()
        } : null);
        
        // Dispatch event to notify news data hook to refresh
        window.dispatchEvent(new CustomEvent('news-configuration-changed'));
        
        toast({
          title: 'Success',
          description: 'RSS feed added successfully'
        });
        return true;
      }
    } catch (error) {
      console.error('Error adding RSS feed:', error);
      toast({
        title: 'Error',
        description: 'Failed to add RSS feed',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [isAdmin, user, toast]);

  // Update news source
  const updateNewsSource = useCallback(async (id: string, updates: Partial<NewsSource>) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can update news sources',
        variant: 'destructive'
      });
      return false;
    }

    setSaving(true);
    try {
      if (getConfig().features.useMockData) {
        setConfiguration(prev => prev ? {
          ...prev,
          newsSources: prev.newsSources.map(source => 
            source.id === id 
              ? { ...source, ...updates, updatedAt: new Date().toISOString() }
              : source
          ),
          lastUpdated: new Date().toISOString()
        } : null);
        
        toast({
          title: 'Success',
          description: 'News source updated successfully'
        });
        return true;
      } else {
        // Real API call
        const updatedSource = await NewsConfigurationService.updateNewsSource(id, updates);
        setConfiguration(prev => prev ? {
          ...prev,
          newsSources: prev.newsSources.map(source => 
            source.id === id ? updatedSource : source
          ),
          lastUpdated: new Date().toISOString()
        } : null);
        
        toast({
          title: 'Success',
          description: 'News source updated successfully'
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating news source:', error);
      toast({
        title: 'Error',
        description: 'Failed to update news source',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [isAdmin, toast]);

  // Update RSS feed
  const updateRSSFeed = useCallback(async (id: string, updates: Partial<RSSFeedConfig>) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can update RSS feeds',
        variant: 'destructive'
      });
      return false;
    }

    setSaving(true);
    try {
      if (getConfig().features.useMockData) {
        setConfiguration(prev => prev ? {
          ...prev,
          rssFeeds: prev.rssFeeds.map(feed => 
            feed.id === id 
              ? { ...feed, ...updates, updatedAt: new Date().toISOString() }
              : feed
          ),
          lastUpdated: new Date().toISOString()
        } : null);
        
        toast({
          title: 'Success',
          description: 'RSS feed updated successfully'
        });
        return true;
      } else {
        // Real API call
        const updatedFeed = await NewsConfigurationService.updateRSSFeed(id, updates);
        setConfiguration(prev => prev ? {
          ...prev,
          rssFeeds: prev.rssFeeds.map(feed => 
            feed.id === id ? updatedFeed : feed
          ),
          lastUpdated: new Date().toISOString()
        } : null);
        
        toast({
          title: 'Success',
          description: 'RSS feed updated successfully'
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating RSS feed:', error);
      toast({
        title: 'Error',
        description: 'Failed to update RSS feed',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [isAdmin, toast]);

  // Delete news source
  const deleteNewsSource = useCallback(async (id: string) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can delete news sources',
        variant: 'destructive'
      });
      return false;
    }

    setSaving(true);
    try {
      if (getConfig().features.useMockData) {
        setConfiguration(prev => prev ? {
          ...prev,
          newsSources: prev.newsSources.filter(source => source.id !== id),
          lastUpdated: new Date().toISOString()
        } : null);
        
        toast({
          title: 'Success',
          description: 'News source deleted successfully'
        });
        return true;
      } else {
        // Real API call
        await NewsConfigurationService.deleteNewsSource(id);
        setConfiguration(prev => prev ? {
          ...prev,
          newsSources: prev.newsSources.filter(source => source.id !== id),
          lastUpdated: new Date().toISOString()
        } : null);
        
        toast({
          title: 'Success',
          description: 'News source deleted successfully'
        });
        return true;
      }
    } catch (error) {
      console.error('Error deleting news source:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete news source',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [isAdmin, toast]);

  // Delete RSS feed
  const deleteRSSFeed = useCallback(async (id: string) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can delete RSS feeds',
        variant: 'destructive'
      });
      return false;
    }

    setSaving(true);
    try {
      if (getConfig().features.useMockData) {
        setConfiguration(prev => prev ? {
          ...prev,
          rssFeeds: prev.rssFeeds.filter(feed => feed.id !== id),
          lastUpdated: new Date().toISOString()
        } : null);
        
        toast({
          title: 'Success',
          description: 'RSS feed deleted successfully'
        });
        return true;
      } else {
        // Real API call
        await NewsConfigurationService.deleteRSSFeed(id);
        setConfiguration(prev => prev ? {
          ...prev,
          rssFeeds: prev.rssFeeds.filter(feed => feed.id !== id),
          lastUpdated: new Date().toISOString()
        } : null);
        
        toast({
          title: 'Success',
          description: 'RSS feed deleted successfully'
        });
        return true;
      }
    } catch (error) {
      console.error('Error deleting RSS feed:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete RSS feed',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [isAdmin, toast]);

  // Update general configuration
  const updateConfiguration = useCallback(async (updates: Partial<NewsConfiguration>) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can update configuration',
        variant: 'destructive'
      });
      return false;
    }

    setSaving(true);
    try {
      if (getConfig().features.useMockData) {
        setConfiguration(prev => prev ? {
          ...prev,
          ...updates,
          lastUpdated: new Date().toISOString()
        } : null);
        
        toast({
          title: 'Success',
          description: 'Configuration updated successfully'
        });
        return true;
      } else {
        // Real API call
        const updatedConfig = await NewsConfigurationService.updateConfiguration(updates);
        setConfiguration(prev => prev ? {
          ...prev,
          ...updatedConfig,
          lastUpdated: new Date().toISOString()
        } : null);
        
        toast({
          title: 'Success',
          description: 'Configuration updated successfully'
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to update configuration',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [isAdmin, toast]);

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  return {
    configuration,
    templates,
    stats,
    loading,
    saving,
    isAdmin,
    addNewsSource,
    addRSSFeed,
    updateNewsSource,
    updateRSSFeed,
    deleteNewsSource,
    deleteRSSFeed,
    updateConfiguration,
    refreshConfiguration: loadConfiguration
  };
}
