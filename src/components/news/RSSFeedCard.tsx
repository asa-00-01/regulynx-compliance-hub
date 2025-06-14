
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rss, ExternalLink, Globe, Clock } from 'lucide-react';
import { RSSFeed } from '@/types/news';

interface RSSFeedCardProps {
  feed: RSSFeed;
}

const RSSFeedCard: React.FC<RSSFeedCardProps> = ({ feed }) => {
  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Rss className="h-5 w-5 text-orange-500" />
            {feed.title}
          </CardTitle>
          <Badge className={getStatusColor(feed.status)}>
            {feed.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            {feed.organization}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {feed.description}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last updated: {formatDate(feed.lastUpdated)}
          </div>
          
          <div className="flex flex-wrap gap-1">
            {feed.categories.map((category, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" asChild className="flex-1">
              <a href={feed.feedUrl} target="_blank" rel="noopener noreferrer">
                <Rss className="h-3 w-3 mr-1" />
                RSS Feed
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild className="flex-1">
              <a href={feed.websiteUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Website
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RSSFeedCard;
