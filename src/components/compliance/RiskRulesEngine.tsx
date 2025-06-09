
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRiskScoring } from './hooks/useRiskScoring';
import { useGlobalRiskAssessment } from '@/hooks/useGlobalRiskAssessment';
import AssessmentHeader from './AssessmentHeader';
import RiskOverviewSection from './RiskOverviewSection';
import RulesManagementSection from './RulesManagementSection';
import RiskDistributionSection from './RiskDistributionSection';

const RiskRulesEngine: React.FC = () => {
  const { usersWithRiskScores, riskDistribution, getRiskScoreClass } = useRiskScoring();
  const { runGlobalAssessment, runningAssessment } = useGlobalRiskAssessment();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  console.log('RiskRulesEngine rendering:', {
    runGlobalAssessment: typeof runGlobalAssessment,
    runningAssessment,
    usersCount: usersWithRiskScores.length
  });

  // Mock active rules count for now - in a real implementation this would come from a hook
  const activeRulesCount = 5; // This would be calculated from the actual rules data

  const handleRunAssessment = () => {
    console.log('=== RiskRulesEngine handleRunAssessment called ===');
    runGlobalAssessment();
  };

  return (
    <div className="space-y-6">
      <Card>
        <AssessmentHeader 
          onRunAssessment={handleRunAssessment}
          isRunningAssessment={runningAssessment}
        />
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rules">Risk Rules</TabsTrigger>
              <TabsTrigger value="distribution">Risk Distribution</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <RiskOverviewSection
                riskDistribution={riskDistribution}
                usersWithRiskScores={usersWithRiskScores}
                activeRulesCount={activeRulesCount}
              />
            </TabsContent>

            <TabsContent value="rules">
              <RulesManagementSection
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </TabsContent>

            <TabsContent value="distribution">
              <RiskDistributionSection
                riskDistribution={riskDistribution}
                usersWithRiskScores={usersWithRiskScores}
                getRiskScoreClass={getRiskScoreClass}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskRulesEngine;
