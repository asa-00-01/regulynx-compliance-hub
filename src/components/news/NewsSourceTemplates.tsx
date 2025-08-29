import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rss, Newspaper, Plus, Star, ExternalLink } from 'lucide-react';
import { NewsSourceTemplate } from '@/types/news';
import { useNewsConfiguration } from '@/hooks/useNewsConfiguration';

interface NewsSourceTemplatesProps {
  onTemplateSelected?: (template: NewsSourceTemplate) => void;
}

export function NewsSourceTemplates({ onTemplateSelected }: NewsSourceTemplatesProps) {
  const { templates, isAdmin } = useNewsConfiguration();

  if (!isAdmin || templates.length === 0) {
    return null;
  }

  const handleAddTemplate = (template: NewsSourceTemplate) => {
    if (onTemplateSelected) {
      onTemplateSelected(template);
    }
  };

  const recommendedTemplates = templates.filter(t => t.isRecommended);
  const otherTemplates = templates.filter(t => !t.isRecommended);

  return (
    <div className="space-y-6">
      {/* Recommended Templates */}
      {recommendedTemplates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommended Sources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {template.type === 'rss' ? (
                        <Rss className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Newspaper className="h-4 w-4 text-blue-500" />
                      )}
                      {template.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {template.type.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.categories.map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddTemplate(template)}
                      className="flex-1"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Source
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href={template.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Templates */}
      {otherTemplates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Other Available Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {template.type === 'rss' ? (
                        <Rss className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Newspaper className="h-4 w-4 text-blue-500" />
                      )}
                      {template.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {template.type.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.categories.map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddTemplate(template)}
                      className="flex-1"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Source
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href={template.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
