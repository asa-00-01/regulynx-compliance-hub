
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rss, Newspaper, Search, ExternalLink, Calendar, Filter, Settings, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NewsCard from './NewsCard';
import RSSFeedCard from './RSSFeedCard';
import { NewsConfigurationDialog } from './NewsConfigurationDialog';
import { useNewsData } from '@/hooks/useNewsData';
import { useNewsConfiguration } from '@/hooks/useNewsConfiguration';
import { useAuth } from '@/context/AuthContext';

const NewsAndRSSFeeds = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  
  const { newsItems, rssFeeds, loading, refetch } = useNewsData();
  const { configuration, isAdmin, stats } = useNewsConfiguration();
  const { user } = useAuth();

  // Filter news items based on search and filters
  const filteredNews = newsItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSource = selectedSource === 'all' || item.source === selectedSource;
    
    return matchesSearch && matchesCategory && matchesSource;
  });

  // Filter RSS feeds based on search
  const filteredFeeds = rssFeeds.filter(feed => {
    return searchTerm === '' || 
      feed.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feed.organization.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get unique categories from configuration and news items
  const getAvailableCategories = () => {
    const configCategories = configuration?.defaultCategories || [];
    const newsCategories = newsItems.map(item => item.category);
    const feedCategories = rssFeeds.flatMap(feed => feed.categories);
    
    const allCategories = [...new Set([...configCategories, ...newsCategories, ...feedCategories])];
    return ['all', ...allCategories];
  };

  // Get unique sources from configuration and news items
  const getAvailableSources = () => {
    const configSources = configuration?.newsSources.map(s => s.name) || [];
    const newsSources = newsItems.map(item => item.source);
    
    const allSources = [...new Set([...configSources, ...newsSources])];
    return ['all', ...allSources];
  };

  const categories = getAvailableCategories();
  const sources = getAvailableSources();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Configuration Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News & RSS Feeds</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest compliance news and regulatory updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {isAdmin && (
            <NewsConfigurationDialog>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure Sources
              </Button>
            </NewsConfigurationDialog>
          )}
        </div>
      </div>

      {/* Stats Overview for Admins */}
      {isAdmin && stats && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalSources}</div>
                <div className="text-sm text-muted-foreground">Total Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeSources}</div>
                <div className="text-sm text-muted-foreground">Active Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalArticles}</div>
                <div className="text-sm text-muted-foreground">Total Articles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.articlesToday}</div>
                <div className="text-sm text-muted-foreground">Today</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Last refresh: {formatDate(stats.lastRefresh)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search news and RSS feeds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-[180px]">
              <Newspaper className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source === 'all' ? 'All Sources' : source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs for News and RSS Feeds */}
      <Tabs defaultValue="news" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            Latest News
            {newsItems.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filteredNews.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="feeds" className="flex items-center gap-2">
            <Rss className="h-4 w-4" />
            RSS Feeds
            {rssFeeds.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filteredFeeds.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(null).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full mb-1"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No news articles found matching your criteria.</p>
                {isAdmin && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Configure news sources to start receiving updates.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNews.map((item) => (
                <NewsCard key={item.id} newsItem={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="feeds" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array(4).fill(null).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredFeeds.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Rss className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No RSS feeds found matching your criteria.</p>
                {isAdmin && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Configure RSS feeds to start receiving automated updates.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFeeds.map((feed) => (
                <RSSFeedCard key={feed.id} feed={feed} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Configuration Status for Admins */}
      {isAdmin && configuration && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">News Sources:</span> {configuration.newsSources.length} configured
                <div className="text-muted-foreground">
                  {configuration.newsSources.filter(s => s.isActive).length} active
                </div>
              </div>
              <div>
                <span className="font-medium">RSS Feeds:</span> {configuration.rssFeeds.length} configured
                <div className="text-muted-foreground">
                  {configuration.rssFeeds.filter(f => f.isActive).length} active
                </div>
              </div>
              <div>
                <span className="font-medium">Auto Refresh:</span> {configuration.enableAutoRefresh ? 'Enabled' : 'Disabled'}
                <div className="text-muted-foreground">
                  {configuration.refreshInterval} minutes interval
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Last updated: {formatDate(configuration.lastUpdated)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewsAndRSSFeeds;
