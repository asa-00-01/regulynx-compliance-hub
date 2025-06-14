
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Clock, Search } from 'lucide-react';
import { DetectedPattern } from '@/types/pattern';

interface PatternCardProps {
  pattern: DetectedPattern;
  onViewDetails: (pattern: DetectedPattern) => void;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, onViewDetails }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'structuring':
        return <TrendingUp className="h-4 w-4" />;
      case 'high_risk_corridor':
        return <AlertTriangle className="h-4 w-4" />;
      case 'time_pattern':
        return <Clock className="h-4 w-4" />;
      case 'velocity':
        return <Search className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(pattern.category)}
            <h4 className="font-semibold">{pattern.name}</h4>
          </div>
          <Badge variant={getSeverityColor(pattern.severity)}>
            {pattern.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          {pattern.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Matches:</span>
            <div className="font-semibold">{pattern.matchCount}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Category:</span>
            <div className="font-semibold capitalize">{pattern.category}</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Last detected: {new Date(pattern.lastDetected).toLocaleString()}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(pattern)}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternCard;
