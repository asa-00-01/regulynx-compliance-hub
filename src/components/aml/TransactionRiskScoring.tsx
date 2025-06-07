
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AMLTransaction } from '@/types/aml';
import { useRiskScoringUnified } from '@/hooks/useRiskScoringUnified';
import RiskRulesDisplay from './RiskRulesDisplay';
import { AlertTriangle, Play, Loader2 } from 'lucide-react';

interface TransactionRiskScoringProps {
  transaction: AMLTransaction;
}

const TransactionRiskScoring: React.FC<TransactionRiskScoringProps> = ({ transaction }) => {
  const { riskAssessment, loading, error, runAssessment } = useRiskScoringUnified(transaction);

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Transaction Risk Assessment</CardTitle>
          <Button 
            onClick={runAssessment}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {loading ? 'Running...' : 'Run Assessment'}
          </Button>
        </CardHeader>
        <CardContent>
          {riskAssessment && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {riskAssessment.total_risk_score}
                </div>
                <div className="text-sm text-muted-foreground">Total Risk Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {riskAssessment.matched_rules.length}
                </div>
                <div className="text-sm text-muted-foreground">Rules Triggered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {riskAssessment.rule_categories.length}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <RiskRulesDisplay transaction={transaction} />
    </div>
  );
};

export default TransactionRiskScoring;
