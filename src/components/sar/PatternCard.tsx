
import React from 'react';
import { Pattern } from '@/types/sar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Search } from 'lucide-react';

interface PatternCardProps {
  pattern: Pattern;
  onViewMatches: (patternId: string) => void;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, onViewMatches }) => {
  const getPatternIcon = (category: Pattern['category']) => {
    switch (category) {
      case 'structuring':
        return (
          <div className="bg-purple-100 rounded-full p-2">
            <ArrowRight className="h-6 w-6 text-purple-600" />
          </div>
        );
      case 'high_risk_corridor':
        return (
          <div className="bg-amber-100 rounded-full p-2">
            <Search className="h-6 w-6 text-amber-600" />
          </div>
        );
      case 'time_pattern':
        return (
          <div className="bg-blue-100 rounded-full p-2">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 rounded-full p-2">
            <Search className="h-6 w-6 text-gray-600" />
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">{pattern.name}</CardTitle>
          <CardDescription>{pattern.description}</CardDescription>
        </div>
        {getPatternIcon(pattern.category)}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{pattern.matchCount}</div>
        <p className="text-sm text-muted-foreground">Matching transactions identified</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => onViewMatches(pattern.id)}>
          View Matches
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PatternCard;
