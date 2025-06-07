
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AMLTransaction } from '@/types/aml';
import { useRiskScoringUnified } from '@/hooks/useRiskScoringUnified';
import RiskRulesDisplay from './RiskRulesDisplay';
import { AlertTriangle } from 'lucide-react';

interface TransactionRiskScoringProps {
  transaction: AMLTransaction;
}

const TransactionRiskScoring: React.FC<TransactionRiskScoringProps> = ({ transaction }) => {
  const { riskAssessment, loading, error, runAssessment } = useRiskScoringUnified(transaction);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Error loading risk assessment: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <RiskRulesDisplay transaction={transaction} />
    </div>
  );
};

export default TransactionRiskScoring;
