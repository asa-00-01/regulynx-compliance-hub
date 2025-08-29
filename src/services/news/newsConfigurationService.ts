import { supabase } from '@/integrations/supabase/client';
import { 
  NewsConfiguration, 
  NewsSource, 
  RSSFeedConfig, 
  NewsSourceTemplate,
  NewsStats 
} from '@/types/news';
import { Json } from '@/integrations/supabase/types';

export class NewsConfigurationService {
  // Get news configuration for the current user's organization
  static async getConfiguration(): Promise<NewsConfiguration | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's customer_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('customer_id')
        .eq('id', user.id)
        .single();

      // If user doesn't have a profile or customer_id, try to create a default customer
      if (!profile?.customer_id) {
        console.log('User not associated with any organization, attempting to create default customer');
        
        // Try to create a default customer for this user
        const defaultCustomer = await this.createDefaultCustomerForUser(user.id, user.email || 'unknown@example.com');
        
        if (defaultCustomer) {
          // Update the user's profile with the new customer_id
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ customer_id: defaultCustomer.id })
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Failed to update user profile with customer_id:', updateError);
          } else {
            console.log('Successfully created default customer and updated user profile');
            // Continue with the new customer_id
            return this.getConfigurationForCustomer(defaultCustomer.id);
          }
        }
        
        // If we couldn't create a customer, return default configuration
        console.log('Could not create default customer, returning default configuration');
        return {
          customerId: null,
          newsSources: [],
          rssFeeds: [],
          defaultCategories: ['regulation', 'aml', 'sanctions', 'compliance'],
          refreshInterval: 60,
          maxArticlesPerSource: 50,
          enableAutoRefresh: true,
          enableNotifications: true,
          lastUpdated: new Date().toISOString()
        };
      }

      return this.getConfigurationForCustomer(profile.customer_id);
    } catch (error) {
      console.error('Error fetching news configuration:', error);
      throw error;
    }
  }

  // Helper method to get configuration for a specific customer
  private static async getConfigurationForCustomer(customerId: string): Promise<NewsConfiguration> {
    // Get news sources
    const { data: newsSources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('*')
      .eq('customer_id', customerId)
      .order('priority', { ascending: false });

    if (sourcesError) throw sourcesError;

    // Get RSS feeds
    const { data: rssFeeds, error: feedsError } = await supabase
      .from('rss_feeds')
      .select('*')
      .eq('customer_id', customerId)
      .order('priority', { ascending: false });

    if (feedsError) throw feedsError;

    // Get organization configuration
    const { data: config, error: configError } = await supabase
      .from('news_configurations')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (configError && configError.code !== 'PGRST116') throw configError; // PGRST116 = no rows returned

    // Convert database fields to TypeScript types
    const convertedNewsSources: NewsSource[] = (newsSources || []).map(source => ({
      id: source.id,
      name: source.name,
      url: source.url,
      description: source.description || '',
      categories: source.categories || [],
      isActive: source.is_active ?? true,
      priority: source.priority || 5,
      lastFetched: source.last_fetched,
      errorCount: source.error_count || 0,
      customerId: source.customer_id,
      createdBy: source.created_by,
      createdAt: source.created_at || new Date().toISOString(),
      updatedAt: source.updated_at || new Date().toISOString()
    }));

    const convertedRssFeeds: RSSFeedConfig[] = (rssFeeds || []).map(feed => ({
      id: feed.id,
      title: feed.title,
      description: feed.description || '',
      feedUrl: feed.feed_url,
      websiteUrl: feed.website_url || '',
      categories: feed.categories || [],
      isActive: feed.is_active ?? true,
      priority: feed.priority || 5,
      refreshInterval: feed.refresh_interval || 60,
      lastFetched: feed.last_fetched,
      errorCount: feed.error_count || 0,
      customerId: feed.customer_id,
      createdBy: feed.created_by,
      createdAt: feed.created_at || new Date().toISOString(),
      updatedAt: feed.updated_at || new Date().toISOString()
    }));

    const configuration: NewsConfiguration = {
      customerId: customerId,
      newsSources: convertedNewsSources,
      rssFeeds: convertedRssFeeds,
      defaultCategories: config?.default_categories || ['regulation', 'aml', 'sanctions', 'compliance'],
      refreshInterval: config?.refresh_interval || 60,
      maxArticlesPerSource: config?.max_articles_per_source || 50,
      enableAutoRefresh: config?.enable_auto_refresh ?? true,
      enableNotifications: config?.enable_notifications ?? true,
      lastUpdated: config?.updated_at || new Date().toISOString()
    };

    return configuration;
  }

  // Update organization configuration
  static async updateConfiguration(updates: Partial<NewsConfiguration>): Promise<NewsConfiguration> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('customer_id')
        .eq('id', user.id)
        .single();

      if (!profile?.customer_id) throw new Error('User not associated with any organization');

      // Check if configuration exists
      const { data: existingConfig } = await supabase
        .from('news_configurations')
        .select('id')
        .eq('customer_id', profile.customer_id)
        .single();

      if (existingConfig) {
        // Update existing configuration
        const { data, error } = await supabase
          .from('news_configurations')
          .update({
            default_categories: updates.defaultCategories,
            refresh_interval: updates.refreshInterval,
            max_articles_per_source: updates.maxArticlesPerSource,
            enable_auto_refresh: updates.enableAutoRefresh,
            enable_notifications: updates.enableNotifications
          })
          .eq('customer_id', profile.customer_id)
          .select()
          .single();

        if (error) throw error;
        
        // Convert database fields to TypeScript type
        return {
          customerId: data.customer_id,
          newsSources: [], // These would need to be fetched separately
          rssFeeds: [], // These would need to be fetched separately
          defaultCategories: data.default_categories || ['regulation', 'aml', 'sanctions', 'compliance'],
          refreshInterval: data.refresh_interval || 60,
          maxArticlesPerSource: data.max_articles_per_source || 50,
          enableAutoRefresh: data.enable_auto_refresh ?? true,
          enableNotifications: data.enable_notifications ?? true,
          lastUpdated: data.updated_at || new Date().toISOString()
        };
      } else {
        // Create new configuration
        const { data, error } = await supabase
          .from('news_configurations')
          .insert({
            customer_id: profile.customer_id,
            default_categories: updates.defaultCategories || ['regulation', 'aml', 'sanctions', 'compliance'],
            refresh_interval: updates.refreshInterval || 60,
            max_articles_per_source: updates.maxArticlesPerSource || 50,
            enable_auto_refresh: updates.enableAutoRefresh ?? true,
            enable_notifications: updates.enableNotifications ?? true
          })
          .select()
          .single();

        if (error) throw error;
        
        // Convert database fields to TypeScript type
        return {
          customerId: data.customer_id,
          newsSources: [], // These would need to be fetched separately
          rssFeeds: [], // These would need to be fetched separately
          defaultCategories: data.default_categories || ['regulation', 'aml', 'sanctions', 'compliance'],
          refreshInterval: data.refresh_interval || 60,
          maxArticlesPerSource: data.max_articles_per_source || 50,
          enableAutoRefresh: data.enable_auto_refresh ?? true,
          enableNotifications: data.enable_notifications ?? true,
          lastUpdated: data.updated_at || new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error updating news configuration:', error);
      throw error;
    }
  }

  // Helper method to create a default customer for a user
  private static async createDefaultCustomerForUser(userId: string, userEmail: string): Promise<{ id: string; name: string; domain: string; subscription_tier: string; settings: Json } | null> {
    try {
      // Create a default customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: `Default Customer for ${userEmail}`,
          domain: userEmail.split('@')[1] || 'example.com',
          subscription_tier: 'basic',
          settings: { features: ['aml', 'kyc', 'sanctions'] }
        })
        .select()
        .single();

      if (customerError) {
        console.error('Failed to create default customer:', customerError);
        return null;
      }

      // Assign the user as a customer admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          customer_id: customer.id,
          role: 'customer_admin'
        });

      if (roleError && roleError.code !== '23505') { // Ignore duplicate key errors
        console.error('Failed to assign customer admin role:', roleError);
      }

      return customer;
    } catch (error) {
      console.error('Error creating default customer:', error);
      return null;
    }
  }

  // Get news source templates
  static async getTemplates(): Promise<NewsSourceTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('news_source_templates')
        .select('*')
        .order('is_recommended', { ascending: false })
        .order('name');

      if (error) {
        console.log('Error fetching news source templates, returning default templates:', error);
        // Return default templates if the table is not available
        return [
          {
            id: '550e8400-e29b-41d4-a716-446655440010',
            name: 'FATF News',
            url: 'https://fatf-gafi.org/news',
            description: 'Financial Action Task Force news and updates',
            categories: ['regulation', 'aml', 'sanctions'],
            type: 'news',
            isRecommended: true
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440011',
            name: 'EU Financial Regulation',
            url: 'https://europa.eu/financial-regulation',
            description: 'European Union financial regulation updates',
            categories: ['regulation', 'compliance', 'eu-regulation'],
            type: 'news',
            isRecommended: true
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440012',
            name: 'OFAC Sanctions',
            url: 'https://treasury.gov/ofac',
            description: 'Office of Foreign Assets Control sanctions updates',
            categories: ['sanctions', 'regulation'],
            type: 'news',
            isRecommended: true
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440013',
            name: 'AML Compliance News',
            url: 'https://amlcompliance.com',
            description: 'Anti-money laundering compliance news',
            categories: ['aml', 'compliance', 'best-practices'],
            type: 'news',
            isRecommended: false
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440014',
            name: 'FATF RSS Feed',
            url: 'https://fatf-gafi.org/rss',
            description: 'FATF RSS feed for automated updates',
            categories: ['regulation', 'aml', 'sanctions'],
            type: 'rss',
            isRecommended: true
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440015',
            name: 'EU Regulation RSS',
            url: 'https://europa.eu/financial-regulation/rss',
            description: 'EU financial regulation RSS feed',
            categories: ['regulation', 'compliance', 'eu-regulation'],
            type: 'rss',
            isRecommended: true
          }
        ];
      }
      
      // Convert database fields to TypeScript types
      return (data || []).map(template => ({
        id: template.id,
        name: template.name,
        url: template.url,
        description: template.description || '',
        categories: template.categories || [],
        type: template.type as 'news' | 'rss',
        isRecommended: template.is_recommended ?? false
      }));
    } catch (error) {
      console.error('Error fetching news source templates:', error);
      throw error;
    }
  }

  // Get news statistics
  static async getStats(): Promise<NewsStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('customer_id')
        .eq('id', user.id)
        .single();

      // If user doesn't have a profile or customer_id, return default stats
      if (!profile?.customer_id) {
        console.log('User not associated with any organization, returning default stats');
        return {
          totalSources: 0,
          activeSources: 0,
          totalArticles: 0,
          articlesToday: 0,
          lastRefresh: new Date().toISOString(),
          errorCount: 0
        };
      }

      // Get news sources count
      const { count: newsSourcesCount } = await supabase
        .from('news_sources')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', profile.customer_id);

      // Get active news sources count
      const { count: activeNewsSourcesCount } = await supabase
        .from('news_sources')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', profile.customer_id)
        .eq('is_active', true);

      // Get RSS feeds count
      const { count: rssFeedsCount } = await supabase
        .from('rss_feeds')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', profile.customer_id);

      // Get active RSS feeds count
      const { count: activeRssFeedsCount } = await supabase
        .from('rss_feeds')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', profile.customer_id)
        .eq('is_active', true);

      const totalSources = (newsSourcesCount || 0) + (rssFeedsCount || 0);
      const activeSources = (activeNewsSourcesCount || 0) + (activeRssFeedsCount || 0);

      return {
        totalSources,
        activeSources,
        totalArticles: 0, // This would need a separate articles table
        articlesToday: 0, // This would need a separate articles table
        lastRefresh: new Date().toISOString(),
        errorCount: 0 // This would need to be tracked separately
      };
    } catch (error) {
      console.error('Error fetching news stats:', error);
      throw error;
    }
  }

  // Add news source
  static async addNewsSource(source: Omit<NewsSource, 'id' | 'customerId' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<NewsSource> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('customer_id')
        .eq('id', user.id)
        .single();

      // If user doesn't have a profile or customer_id, try to create a default customer
      if (!profile?.customer_id) {
        console.log('User not associated with any organization, attempting to create default customer');
        
        const defaultCustomer = await this.createDefaultCustomerForUser(user.id, user.email || 'unknown@example.com');
        
        if (defaultCustomer) {
          // Update the user's profile with the new customer_id
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ customer_id: defaultCustomer.id })
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Failed to update user profile with customer_id:', updateError);
            // Return mock response if we can't update the profile
            return {
              id: `mock_${Date.now()}`,
              name: source.name,
              url: source.url,
              description: source.description,
              categories: source.categories,
              isActive: source.isActive,
              priority: source.priority,
              errorCount: source.errorCount,
              lastFetched: null,
              customerId: null,
              createdBy: user.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
          
          console.log('Successfully created default customer and updated user profile');
          // Continue with the new customer_id
          return this.addNewsSourceForCustomer(source, defaultCustomer.id, user.id);
        }
        
        // If we couldn't create a customer, return mock response
        console.log('Could not create default customer, returning mock news source');
        return {
          id: `mock_${Date.now()}`,
          name: source.name,
          url: source.url,
          description: source.description,
          categories: source.categories,
          isActive: source.isActive,
          priority: source.priority,
          errorCount: source.errorCount,
          lastFetched: null,
          customerId: null,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      return this.addNewsSourceForCustomer(source, profile.customer_id, user.id);
    } catch (error) {
      console.error('Error adding news source:', error);
      throw error;
    }
  }

  // Helper method to add news source for a specific customer
  private static async addNewsSourceForCustomer(source: Omit<NewsSource, 'id' | 'customerId' | 'createdBy' | 'createdAt' | 'updatedAt'>, customerId: string, userId: string): Promise<NewsSource> {
    const { data, error } = await supabase
      .from('news_sources')
      .insert({
        name: source.name,
        url: source.url,
        description: source.description,
        categories: source.categories,
        is_active: source.isActive,
        priority: source.priority,
        error_count: source.errorCount,
        customer_id: customerId,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    
    // Convert database fields to TypeScript type
    return {
      id: data.id,
      name: data.name,
      url: data.url,
      description: data.description || '',
      categories: data.categories || [],
      isActive: data.is_active ?? true,
      priority: data.priority || 5,
      lastFetched: data.last_fetched,
      errorCount: data.error_count || 0,
      customerId: data.customer_id,
      createdBy: data.created_by,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString()
    };
  }

  // Add RSS feed
  static async addRSSFeed(feed: Omit<RSSFeedConfig, 'id' | 'customerId' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<RSSFeedConfig> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('customer_id')
        .eq('id', user.id)
        .single();

      // If user doesn't have a profile or customer_id, try to create a default customer
      if (!profile?.customer_id) {
        console.log('User not associated with any organization, attempting to create default customer');
        
        const defaultCustomer = await this.createDefaultCustomerForUser(user.id, user.email || 'unknown@example.com');
        
        if (defaultCustomer) {
          // Update the user's profile with the new customer_id
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ customer_id: defaultCustomer.id })
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Failed to update user profile with customer_id:', updateError);
            // Return mock response if we can't update the profile
            return {
              id: `mock_${Date.now()}`,
              title: feed.title,
              description: feed.description,
              feedUrl: feed.feedUrl,
              websiteUrl: feed.websiteUrl,
              categories: feed.categories,
              isActive: feed.isActive,
              priority: feed.priority,
              refreshInterval: feed.refreshInterval,
              errorCount: feed.errorCount,
              lastFetched: null,
              customerId: null,
              createdBy: user.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
          
          console.log('Successfully created default customer and updated user profile');
          // Continue with the new customer_id
          return this.addRSSFeedForCustomer(feed, defaultCustomer.id, user.id);
        }
        
        // If we couldn't create a customer, return mock response
        console.log('Could not create default customer, returning mock RSS feed');
        return {
          id: `mock_${Date.now()}`,
          title: feed.title,
          description: feed.description,
          feedUrl: feed.feedUrl,
          websiteUrl: feed.websiteUrl,
          categories: feed.categories,
          isActive: feed.isActive,
          priority: feed.priority,
          refreshInterval: feed.refreshInterval,
          errorCount: feed.errorCount,
          lastFetched: null,
          customerId: null,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      return this.addRSSFeedForCustomer(feed, profile.customer_id, user.id);
    } catch (error) {
      console.error('Error adding RSS feed:', error);
      throw error;
    }
  }

  // Helper method to add RSS feed for a specific customer
  private static async addRSSFeedForCustomer(feed: Omit<RSSFeedConfig, 'id' | 'customerId' | 'createdBy' | 'createdAt' | 'updatedAt'>, customerId: string, userId: string): Promise<RSSFeedConfig> {
    const { data, error } = await supabase
      .from('rss_feeds')
      .insert({
        title: feed.title,
        description: feed.description,
        feed_url: feed.feedUrl,
        website_url: feed.websiteUrl,
        categories: feed.categories,
        is_active: feed.isActive,
        priority: feed.priority,
        refresh_interval: feed.refreshInterval,
        error_count: feed.errorCount,
        customer_id: customerId,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    
    // Convert database fields to TypeScript type
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      feedUrl: data.feed_url,
      websiteUrl: data.website_url || '',
      categories: data.categories || [],
      isActive: data.is_active ?? true,
      priority: data.priority || 5,
      refreshInterval: data.refresh_interval || 60,
      lastFetched: data.last_fetched,
      errorCount: data.error_count || 0,
      customerId: data.customer_id,
      createdBy: data.created_by,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString()
    };
  }

  // Update news source
  static async updateNewsSource(id: string, updates: Partial<NewsSource>): Promise<NewsSource> {
    try {
      const { data, error } = await supabase
        .from('news_sources')
        .update({
          name: updates.name,
          url: updates.url,
          description: updates.description,
          categories: updates.categories,
          is_active: updates.isActive,
          priority: updates.priority,
          error_count: updates.errorCount,
          last_fetched: updates.lastFetched
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Convert database fields to TypeScript type
      return {
        id: data.id,
        name: data.name,
        url: data.url,
        description: data.description || '',
        categories: data.categories || [],
        isActive: data.is_active ?? true,
        priority: data.priority || 5,
        lastFetched: data.last_fetched,
        errorCount: data.error_count || 0,
        customerId: data.customer_id,
        createdBy: data.created_by,
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating news source:', error);
      throw error;
    }
  }

  // Update RSS feed
  static async updateRSSFeed(id: string, updates: Partial<RSSFeedConfig>): Promise<RSSFeedConfig> {
    try {
      const { data, error } = await supabase
        .from('rss_feeds')
        .update({
          title: updates.title,
          description: updates.description,
          feed_url: updates.feedUrl,
          website_url: updates.websiteUrl,
          categories: updates.categories,
          is_active: updates.isActive,
          priority: updates.priority,
          refresh_interval: updates.refreshInterval,
          error_count: updates.errorCount,
          last_fetched: updates.lastFetched
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Convert database fields to TypeScript type
      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        feedUrl: data.feed_url,
        websiteUrl: data.website_url || '',
        categories: data.categories || [],
        isActive: data.is_active ?? true,
        priority: data.priority || 5,
        refreshInterval: data.refresh_interval || 60,
        lastFetched: data.last_fetched,
        errorCount: data.error_count || 0,
        customerId: data.customer_id,
        createdBy: data.created_by,
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating RSS feed:', error);
      throw error;
    }
  }

  // Delete news source
  static async deleteNewsSource(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('news_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting news source:', error);
      throw error;
    }
  }

  // Delete RSS feed
  static async deleteRSSFeed(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rss_feeds')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting RSS feed:', error);
      throw error;
    }
  }
}
