
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MatchesList from '@/components/sar/MatchesList';
import { AlertTriangle, TrendingUp, Clock, Search } from 'lucide-react';
import { Pattern, PatternMatch } from '@/types/sar';

interface PatternMatchesViewProps {
  pattern: Pattern;
  matches: PatternMatch[];
  isLoading: boolean;
  onCreateAlert: (match: PatternMatch) => void;
  onCreateSAR: (match: PatternMatch) => void;
}

const getPatternTypeIcon = (category: string) => {
    switch (category) {
        case 'structuring':
            return <TrendingUp className="h-5 w-5 text-purple-600" />;
        case 'high_risk_corridor':
            return <AlertTriangle className="h-5 w-5 text-red-600" />;
        case 'time_pattern':
            return <Clock className="h-5 w-5 text-blue-600" />;
        default:
            return <Search className="h-5 w-5 text-gray-600" />;
    }
};

const PatternMatchesView: React.FC<PatternMatchesViewProps> = ({ pattern, matches, isLoading, onCreateAlert, onCreateSAR }) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getPatternTypeIcon(pattern.category)}
                        <CardTitle>{pattern.name}</CardTitle>
                    </div>
                    <Badge variant="outline">
                        {pattern.matchCount} matches
                    </Badge>
                </div>
                <p className="text-muted-foreground">{pattern.description}</p>
            </CardHeader>
            <CardContent>
                <MatchesList
                    matches={matches}
                    onCreateAlert={onCreateAlert}
                    onCreateSAR={onCreateSAR}
                    isLoading={isLoading}
                />
            </CardContent>
        </Card>
    );
};

export default PatternMatchesView;
