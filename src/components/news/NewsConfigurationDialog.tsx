import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Rss, 
  Newspaper,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { NewsSource, RSSFeedConfig, NewsSourceTemplate } from '@/types/news';
import { useNewsConfiguration } from '@/hooks/useNewsConfiguration';
import { NewsSourceTemplates } from './NewsSourceTemplates';

interface NewsConfigurationDialogProps {
  children: React.ReactNode;
}

export function NewsConfigurationDialog({ children }: NewsConfigurationDialogProps) {
  const { 
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
    updateConfiguration
  } = useNewsConfiguration();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('sources');
  const [editingSource, setEditingSource] = useState<NewsSource | null>(null);
  const [editingFeed, setEditingFeed] = useState<RSSFeedConfig | null>(null);

  // Form states for adding new sources/feeds
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    description: '',
    categories: [] as string[],
    isActive: true,
    priority: 5,
    errorCount: 0
  });

  const [newFeed, setNewFeed] = useState({
    title: '',
    description: '',
    feedUrl: '',
    websiteUrl: '',
    categories: [] as string[],
    isActive: true,
    priority: 5,
    refreshInterval: 60,
    errorCount: 0
  });

  const [newCategory, setNewCategory] = useState('');

  const handleAddNewsSource = async () => {
    if (!newSource.name || !newSource.url) return;
    
    const success = await addNewsSource(newSource);
    if (success) {
      setNewSource({
        name: '',
        url: '',
        description: '',
        categories: [],
        isActive: true,
        priority: 5,
        errorCount: 0
      });
    }
  };

  const handleAddRSSFeed = async () => {
    if (!newFeed.title || !newFeed.feedUrl) {
      return;
    }
    
    const success = await addRSSFeed(newFeed);
    if (success) {
      setNewFeed({
        title: '',
        description: '',
        feedUrl: '',
        websiteUrl: '',
        categories: [],
        isActive: true,
        priority: 5,
        refreshInterval: 60,
        errorCount: 0
      });
    }
  };

  const handleUpdateNewsSource = async () => {
    if (!editingSource) return;
    
    const success = await updateNewsSource(editingSource.id, editingSource);
    if (success) {
      setEditingSource(null);
    }
  };

  const handleUpdateRSSFeed = async () => {
    if (!editingFeed) return;
    
    const success = await updateRSSFeed(editingFeed.id, editingFeed);
    if (success) {
      setEditingFeed(null);
    }
  };

  const handleDeleteNewsSource = async (id: string) => {
    if (confirm('Are you sure you want to delete this news source?')) {
      await deleteNewsSource(id);
    }
  };

  const handleDeleteRSSFeed = async (id: string) => {
    if (confirm('Are you sure you want to delete this RSS feed?')) {
      await deleteRSSFeed(id);
    }
  };

  const addCategoryToSource = (source: NewsSource, category: string) => {
    if (category && !source.categories.includes(category)) {
      setEditingSource({
        ...source,
        categories: [...source.categories, category]
      });
    }
  };

  const addCategoryToFeed = (feed: RSSFeedConfig, category: string) => {
    if (category && !feed.categories.includes(category)) {
      setEditingFeed({
        ...feed,
        categories: [...feed.categories, category]
      });
    }
  };

  const removeCategory = (source: NewsSource, category: string) => {
    setEditingSource({
      ...source,
      categories: source.categories.filter(c => c !== category)
    });
  };

  const removeFeedCategory = (feed: RSSFeedConfig, category: string) => {
    setEditingFeed({
      ...feed,
      categories: feed.categories.filter(c => c !== category)
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAdmin) {
    return null; // Don't show configuration dialog for non-admins
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            News & RSS Configuration
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configuration Overview</CardTitle>
                </CardHeader>
                <CardContent>
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
                  <div className="mt-4 text-sm text-muted-foreground">
                    Last refresh: {formatDate(stats.lastRefresh)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Configuration Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="sources">News Sources</TabsTrigger>
                <TabsTrigger value="feeds">RSS Feeds</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* News Sources Tab */}
              <TabsContent value="sources" className="space-y-4">
                {/* Add New Source */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add News Source
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="source-name">Name</Label>
                        <Input
                          id="source-name"
                          value={newSource.name}
                          onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                          placeholder="e.g., FATF News"
                        />
                      </div>
                      <div>
                        <Label htmlFor="source-url">URL</Label>
                        <Input
                          id="source-url"
                          value={newSource.url}
                          onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                          placeholder="https://example.com/news"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="source-description">Description</Label>
                      <Textarea
                        id="source-description"
                        value={newSource.description}
                        onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                        placeholder="Brief description of the news source"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="source-priority">Priority (1-10)</Label>
                        <Select
                          value={newSource.priority.toString()}
                          onValueChange={(value) => setNewSource({ ...newSource, priority: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 10 ? '(Highest)' : num === 1 ? '(Lowest)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="source-active"
                          checked={newSource.isActive}
                          onCheckedChange={(checked) => setNewSource({ ...newSource, isActive: checked })}
                        />
                        <Label htmlFor="source-active">Active</Label>
                      </div>
                    </div>
                    <Button onClick={handleAddNewsSource} disabled={saving || !newSource.name || !newSource.url}>
                      {saving ? 'Adding...' : 'Add News Source'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing Sources */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configured News Sources</h3>
                  {configuration?.newsSources.map((source) => (
                    <Card key={source.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Newspaper className="h-4 w-4" />
                            {source.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant={source.isActive ? 'default' : 'secondary'}>
                              {source.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">Priority {source.priority}</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingSource(source)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteNewsSource(source.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">{source.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <ExternalLink className="h-3 w-3" />
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {source.url}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          Last fetched: {source.lastFetched ? formatDate(source.lastFetched) : 'Never'}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {source.categories.map((category) => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* RSS Feeds Tab */}
              <TabsContent value="feeds" className="space-y-4">
                {/* Add New RSS Feed */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add RSS Feed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="feed-title">Title</Label>
                        <Input
                          id="feed-title"
                          value={newFeed.title}
                          onChange={(e) => setNewFeed({ ...newFeed, title: e.target.value })}
                          placeholder="e.g., FATF RSS Feed"
                        />
                      </div>
                      <div>
                        <Label htmlFor="feed-url">RSS URL</Label>
                        <Input
                          id="feed-url"
                          value={newFeed.feedUrl}
                          onChange={(e) => setNewFeed({ ...newFeed, feedUrl: e.target.value })}
                          placeholder="https://example.com/rss"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="feed-description">Description</Label>
                      <Textarea
                        id="feed-description"
                        value={newFeed.description}
                        onChange={(e) => setNewFeed({ ...newFeed, description: e.target.value })}
                        placeholder="Brief description of the RSS feed"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="feed-priority">Priority (1-10)</Label>
                        <Select
                          value={newFeed.priority.toString()}
                          onValueChange={(value) => setNewFeed({ ...newFeed, priority: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 10 ? '(Highest)' : num === 1 ? '(Lowest)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="feed-interval">Refresh Interval (minutes)</Label>
                        <Select
                          value={newFeed.refreshInterval.toString()}
                          onValueChange={(value) => setNewFeed({ ...newFeed, refreshInterval: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                            <SelectItem value="240">4 hours</SelectItem>
                            <SelectItem value="480">8 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="feed-active"
                          checked={newFeed.isActive}
                          onCheckedChange={(checked) => setNewFeed({ ...newFeed, isActive: checked })}
                        />
                        <Label htmlFor="feed-active">Active</Label>
                      </div>
                    </div>
                    <Button onClick={handleAddRSSFeed} disabled={saving || !newFeed.title || !newFeed.feedUrl}>
                      {saving ? 'Adding...' : 'Add RSS Feed'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing RSS Feeds */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configured RSS Feeds</h3>
                  {configuration?.rssFeeds.map((feed) => (
                    <Card key={feed.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Rss className="h-4 w-4" />
                            {feed.title}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant={feed.isActive ? 'default' : 'secondary'}>
                              {feed.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">Priority {feed.priority}</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingFeed(feed)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteRSSFeed(feed.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">{feed.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Rss className="h-3 w-3" />
                          <a href={feed.feedUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {feed.feedUrl}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          Last fetched: {feed.lastFetched ? formatDate(feed.lastFetched) : 'Never'} | 
                          Refresh: {feed.refreshInterval} minutes
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {feed.categories.map((category) => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Add from Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add pre-configured news sources and RSS feeds with one click. These templates include popular regulatory and compliance news sources.
                    </p>
                    <NewsSourceTemplates 
                                             onTemplateSelected={(template) => {
                         if (template.type === 'news') {
                           setNewSource({
                             name: template.name,
                             url: template.url,
                             description: template.description,
                             categories: template.categories,
                             isActive: true,
                             priority: 5,
                             errorCount: 0
                           });
                           setActiveTab('sources');
                         } else {
                           setNewFeed({
                             title: template.name,
                             description: template.description,
                             feedUrl: template.url,
                             websiteUrl: template.url,
                             categories: template.categories,
                             isActive: true,
                             priority: 5,
                             refreshInterval: 60,
                             errorCount: 0
                           });
                           setActiveTab('feeds');
                         }
                       }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="refresh-interval">Default Refresh Interval (minutes)</Label>
                        <Select
                          value={configuration?.refreshInterval.toString() || '60'}
                          onValueChange={(value) => updateConfiguration({ refreshInterval: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                            <SelectItem value="240">4 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="max-articles">Max Articles per Source</Label>
                        <Input
                          id="max-articles"
                          type="number"
                          value={configuration?.maxArticlesPerSource || 50}
                          onChange={(e) => updateConfiguration({ maxArticlesPerSource: parseInt(e.target.value) })}
                          min="1"
                          max="100"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="auto-refresh"
                          checked={configuration?.enableAutoRefresh || false}
                          onCheckedChange={(checked) => updateConfiguration({ enableAutoRefresh: checked })}
                        />
                        <Label htmlFor="auto-refresh">Enable Auto Refresh</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="notifications"
                          checked={configuration?.enableNotifications || false}
                          onCheckedChange={(checked) => updateConfiguration({ enableNotifications: checked })}
                        />
                        <Label htmlFor="notifications">Enable Notifications</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Edit Source Dialog */}
        {editingSource && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit News Source</h3>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editingSource.name}
                    onChange={(e) => setEditingSource({ ...editingSource, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    value={editingSource.url}
                    onChange={(e) => setEditingSource({ ...editingSource, url: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingSource.description}
                    onChange={(e) => setEditingSource({ ...editingSource, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={editingSource.priority.toString()}
                      onValueChange={(value) => setEditingSource({ ...editingSource, priority: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingSource.isActive}
                      onCheckedChange={(checked) => setEditingSource({ ...editingSource, isActive: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <div>
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {editingSource.categories.map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                        <button
                          onClick={() => removeCategory(editingSource, category)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Add category"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addCategoryToSource(editingSource, newCategory);
                          setNewCategory('');
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        addCategoryToSource(editingSource, newCategory);
                        setNewCategory('');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateNewsSource} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingSource(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Feed Dialog */}
        {editingFeed && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit RSS Feed</h3>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingFeed.title}
                    onChange={(e) => setEditingFeed({ ...editingFeed, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>RSS URL</Label>
                  <Input
                    value={editingFeed.feedUrl}
                    onChange={(e) => setEditingFeed({ ...editingFeed, feedUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingFeed.description}
                    onChange={(e) => setEditingFeed({ ...editingFeed, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={editingFeed.priority.toString()}
                      onValueChange={(value) => setEditingFeed({ ...editingFeed, priority: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Refresh Interval</Label>
                    <Select
                      value={editingFeed.refreshInterval.toString()}
                      onValueChange={(value) => setEditingFeed({ ...editingFeed, refreshInterval: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingFeed.isActive}
                    onCheckedChange={(checked) => setEditingFeed({ ...editingFeed, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <div>
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {editingFeed.categories.map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                        <button
                          onClick={() => removeFeedCategory(editingFeed, category)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Add category"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addCategoryToFeed(editingFeed, newCategory);
                          setNewCategory('');
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        addCategoryToFeed(editingFeed, newCategory);
                        setNewCategory('');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateRSSFeed} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingFeed(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
