
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, Building } from 'lucide-react';
import { NewsItem } from '@/types/news';

interface NewsCardProps {
  newsItem: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      aml: 'bg-red-100 text-red-800',
      kyc: 'bg-blue-100 text-blue-800',
      sanctions: 'bg-orange-100 text-orange-800',
      regulatory: 'bg-purple-100 text-purple-800',
      compliance: 'bg-green-100 text-green-800',
      fintech: 'bg-indigo-100 text-indigo-800',
      'eu-regulation': 'bg-yellow-100 text-yellow-800',
      'sweden-regulation': 'bg-cyan-100 text-cyan-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'eu-regulation': 'EU REG',
      'sweden-regulation': 'SE REG',
    };
    return labels[category] || category.toUpperCase();
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Badge className={getCategoryColor(newsItem.category)}>
            {getCategoryLabel(newsItem.category)}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(newsItem.publishedAt)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
          {newsItem.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-3 flex-1">
          {newsItem.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center text-xs text-muted-foreground">
            <Building className="h-3 w-3 mr-1" />
            {newsItem.source.toUpperCase()}
          </div>
          <Button size="sm" variant="outline" asChild>
            <a href={newsItem.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Read
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
