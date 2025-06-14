
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rss, Newspaper, Search, ExternalLink, Calendar, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NewsCard from './NewsCard';
import RSSFeedCard from './RSSFeedCard';
import { useNewsData } from '@/hooks/useNewsData';

const NewsAndRSSFeeds = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  
  const { newsItems, rssFeeds, loading } = useNewsData();

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

  const categories = [
    'all', 'aml', 'kyc', 'sanctions', 'regulatory', 'compliance', 'fintech',
    'eu-regulation', 'sweden-regulation'
  ];
  
  const sources = [
    'all', 'fincen', 'fatf', 'ofac', 'sec', 'cftc', 'federal-register', 'ecb-banking',
    'eba', 'esma', 'european-commission', 'finansinspektionen', 'riksbank', 'skatteverket'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">News & RSS Feeds</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with the latest regulatory news and compliance updates from US, EU, and Swedish authorities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Newspaper className="h-3 w-3" />
            {filteredNews.length} Articles
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Rss className="h-3 w-3" />
            {filteredFeeds.length} Feeds
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news and feeds..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : 
                       category === 'eu-regulation' ? 'EU Regulation' :
                       category === 'sweden-regulation' ? 'Sweden Regulation' :
                       category.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source === 'all' ? 'All Sources' : 
                       source === 'ecb-banking' ? 'ECB Banking' :
                       source === 'european-commission' ? 'EU Commission' :
                       source.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedSource('all');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for News and RSS Feeds */}
      <Tabs defaultValue="news" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            Latest News
          </TabsTrigger>
          <TabsTrigger value="feeds" className="flex items-center gap-2">
            <Rss className="h-4 w-4" />
            RSS Feeds
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
    </div>
  );
};

export default NewsAndRSSFeeds;
