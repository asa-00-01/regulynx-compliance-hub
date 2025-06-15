
import React from 'react';
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';
import { useRiskRules } from '@/hooks/useRiskRules';
import RiskScoreSummary from './RiskScoreSummary';
import TriggeredRules from './TriggeredRules';
import AvailableRules from './AvailableRules';

interface RiskRulesDisplayProps {
  transaction?: AMLTransaction;
  user?: UnifiedUserData;
}

const RiskRulesDisplay: React.FC<RiskRulesDisplayProps> = ({ transaction, user }) => {
  const {
    loading,
    totalRiskScore,
    riskMatches,
    filteredMatches,
    allRules,
    selectedCategory,
    setSelectedCategory,
    runRiskAssessment,
    triggeredRuleIds,
  } = useRiskRules({ transaction, user });

  return (
    <div className="space-y-6">
      <RiskScoreSummary
        totalRiskScore={totalRiskScore}
        riskMatchesCount={riskMatches.length}
        onRunAssessment={runRiskAssessment}
        loading={loading}
      />
      
      <TriggeredRules
        matches={filteredMatches}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <AvailableRules
        rules={allRules}
        triggeredRuleIds={triggeredRuleIds}
        category={selectedCategory}
      />
    </div>
  );
};

export default RiskRulesDisplay;
