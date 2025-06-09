
import React from 'react';
import RiskDistributionChart from './RiskDistributionChart';
import RiskScoreTable from './RiskScoreTable';
import { RiskDistributionItem, UserWithRiskScore } from './types/riskScoringTypes';

interface RiskDistributionSectionProps {
  riskDistribution: RiskDistributionItem[];
  usersWithRiskScores: UserWithRiskScore[];
  getRiskScoreClass: (score: number) => string;
}

const RiskDistributionSection: React.FC<RiskDistributionSectionProps> = ({
  riskDistribution,
  usersWithRiskScores,
  getRiskScoreClass
}) => {
  return (
    <div className="space-y-6">
      {/* Risk Distribution Chart */}
      <RiskDistributionChart riskDistribution={riskDistribution} />
      
      {/* Risk Score Breakdown Table */}
      <RiskScoreTable 
        usersWithRiskScores={usersWithRiskScores} 
        getRiskScoreClass={getRiskScoreClass} 
      />
    </div>
  );
};

export default RiskDistributionSection;
