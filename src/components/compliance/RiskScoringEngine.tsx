
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRiskScoring } from './hooks/useRiskScoring';
import RiskDistributionChart from './RiskDistributionChart';
import RiskScoreTable from './RiskScoreTable';

const RiskScoringEngine: React.FC = () => {
  const { usersWithRiskScores, riskDistribution, getRiskScoreClass } = useRiskScoring();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Risk Scoring Engine</CardTitle>
          <CardDescription>
            Dynamic risk assessment based on multiple factors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Distribution Chart */}
          <RiskDistributionChart riskDistribution={riskDistribution} />
          
          {/* Risk Score Breakdown Table */}
          <RiskScoreTable 
            usersWithRiskScores={usersWithRiskScores} 
            getRiskScoreClass={getRiskScoreClass} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskScoringEngine;
