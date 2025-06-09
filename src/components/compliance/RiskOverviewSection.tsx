
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import RiskDistributionChart from './RiskDistributionChart';
import { RiskDistributionItem, UserWithRiskScore } from './types/riskScoringTypes';

interface RiskOverviewSectionProps {
  riskDistribution: RiskDistributionItem[];
  usersWithRiskScores: UserWithRiskScore[];
  activeRulesCount: number;
}

const RiskOverviewSection: React.FC<RiskOverviewSectionProps> = ({
  riskDistribution,
  usersWithRiskScores,
  activeRulesCount
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Risk Distribution Chart */}
      <RiskDistributionChart riskDistribution={riskDistribution} />
      
      {/* Quick Stats */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{activeRulesCount}</div>
                <div className="text-sm text-muted-foreground">Active Rules</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {usersWithRiskScores.filter(u => u.riskScore > 70).length}
                </div>
                <div className="text-sm text-muted-foreground">High Risk Users</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RiskOverviewSection;
