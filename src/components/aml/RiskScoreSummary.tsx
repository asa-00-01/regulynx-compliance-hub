
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import RiskBadge from '@/components/common/RiskBadge';

interface RiskScoreSummaryProps {
  totalRiskScore: number;
  riskMatchesCount: number;
  onRunAssessment: () => void;
  loading: boolean;
}

const RiskScoreSummary: React.FC<RiskScoreSummaryProps> = ({
  totalRiskScore,
  riskMatchesCount,
  onRunAssessment,
  loading,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Risk Assessment Score</CardTitle>
        <Button 
          onClick={onRunAssessment} 
          disabled={loading}
          size="sm"
          className="ml-auto"
        >
          {loading ? 'Evaluating...' : 'Run Assessment'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span className="text-2xl font-bold">{totalRiskScore}</span>
            <span className="text-muted-foreground">/ 100</span>
          </div>
          <RiskBadge score={totalRiskScore} />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {riskMatchesCount} rule{riskMatchesCount !== 1 ? 's' : ''} triggered
        </p>
      </CardContent>
    </Card>
  );
};

export default RiskScoreSummary;
