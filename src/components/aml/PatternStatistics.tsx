
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { DetectedPattern } from '@/types/pattern';

interface PatternStatisticsProps {
  patterns: DetectedPattern[];
}

const PatternStatistics: React.FC<PatternStatisticsProps> = ({ patterns }) => {
  if (patterns.length === 0) {
    return null;
  }

  const highSeverityCount = patterns.filter(p => p.severity === 'high').length;
  const totalMatches = patterns.reduce((sum, p) => sum + p.matchCount, 0);
  const uniqueCategories = new Set(patterns.map(p => p.category)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Patterns</p>
              <p className="text-2xl font-bold">{patterns.length}</p>
            </div>
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">High Severity</p>
              <p className="text-2xl font-bold text-red-600">{highSeverityCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
              <p className="text-2xl font-bold">{totalMatches}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{uniqueCategories}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatternStatistics;
