
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Play, Loader2 } from 'lucide-react';
import { useRiskRulesManagement, Rule } from '@/hooks/useRiskRulesManagement';
import { evaluateTransactionRisk, evaluateUserRisk } from '@/services/riskScoringService';
import { useCompliance } from '@/context/compliance';
import { useToast } from '@/hooks/use-toast';
import RuleFormDialog from './RuleFormDialog';
import RulesTable from './RulesTable';

const RiskRulesManagement: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [runningAssessment, setRunningAssessment] = useState(false);
  const { state } = useCompliance();
  const { toast } = useToast();

  const {
    rules,
    loading,
    saveRule,
    toggleRuleStatus,
    deleteRule
  } = useRiskRulesManagement(selectedCategory);

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
  };

  const handleCloseDialog = () => {
    setEditingRule(null);
  };

  const runGlobalAssessment = async () => {
    setRunningAssessment(true);
    try {
      let totalAssessments = 0;
      let successfulAssessments = 0;

      console.log('Starting global risk assessment...');

      // Run assessments for all users
      for (const user of state.users) {
        try {
          totalAssessments++;
          console.log(`Assessing user: ${user.fullName}`);
          const result = await evaluateUserRisk(user);
          console.log(`User ${user.fullName} assessment result:`, result);
          successfulAssessments++;
        } catch (error) {
          console.error(`Error assessing user ${user.id}:`, error);
        }
      }

      // Create mock transactions for demonstration
      const mockTransactions = [
        {
          id: 'tx_high_risk_001',
          senderUserId: 'user_001',
          senderName: 'Ahmed Hassan',
          receiverUserId: 'user_002',
          receiverName: 'Jane Doe',
          senderAmount: 18000,
          receiverAmount: 17850,
          senderCurrency: 'USD' as const,
          receiverCurrency: 'USD' as const,
          senderCountryCode: 'AF', // High risk country
          receiverCountryCode: 'US',
          method: 'direct_integration' as const, // High risk method
          timestamp: new Date().toISOString(),
          status: 'completed' as const,
          reasonForSending: 'Business payment',
          isSuspect: true,
          riskScore: 75
        },
        {
          id: 'tx_medium_risk_002',
          senderUserId: 'user_003',
          senderName: 'Michael Johnson',
          receiverUserId: 'user_004',
          receiverName: 'Sofia Rodriguez',
          senderAmount: 8500,
          receiverAmount: 8400,
          senderCurrency: 'USD' as const,
          receiverCurrency: 'USD' as const,
          senderCountryCode: 'US',
          receiverCountryCode: 'CO',
          method: 'bank' as const,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed' as const,
          reasonForSending: 'Investment',
          isSuspect: false,
          riskScore: 45
        },
        {
          id: 'tx_low_risk_003',
          senderUserId: 'user_005',
          senderName: 'Lisa Chen',
          receiverUserId: 'user_006',
          receiverName: 'David Johnson',
          senderAmount: 2500,
          receiverAmount: 2475,
          senderCurrency: 'USD' as const,
          receiverCurrency: 'USD' as const,
          senderCountryCode: 'SG',
          receiverCountryCode: 'UK',
          method: 'bank' as const,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          status: 'completed' as const,
          reasonForSending: 'Personal transfer',
          isSuspect: false,
          riskScore: 15
        }
      ];

      // Run assessments for mock transactions
      for (const transaction of mockTransactions) {
        try {
          totalAssessments++;
          console.log(`Assessing transaction: ${transaction.id}`);
          const result = await evaluateTransactionRisk(transaction);
          console.log(`Transaction ${transaction.id} assessment result:`, result);
          successfulAssessments++;
        } catch (error) {
          console.error(`Error assessing transaction ${transaction.id}:`, error);
        }
      }

      toast({
        title: 'Assessment Complete',
        description: `Successfully assessed ${successfulAssessments} out of ${totalAssessments} entities`,
      });

      console.log(`Global assessment completed: ${successfulAssessments}/${totalAssessments} successful`);
    } catch (error) {
      console.error('Error running global assessment:', error);
      toast({
        title: 'Assessment Error',
        description: 'Failed to complete risk assessment',
        variant: 'destructive'
      });
    } finally {
      setRunningAssessment(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Risk Rules Management
          </CardTitle>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runGlobalAssessment}
            disabled={runningAssessment || rules.length === 0}
            className="flex items-center gap-2"
          >
            {runningAssessment ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {runningAssessment ? 'Running Assessment...' : 'Run Global Assessment'}
          </Button>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="transaction">Transaction</SelectItem>
              <SelectItem value="kyc">KYC</SelectItem>
              <SelectItem value="behavioral">Behavioral</SelectItem>
            </SelectContent>
          </Select>
          <RuleFormDialog
            editingRule={editingRule}
            loading={loading}
            onSave={saveRule}
            onClose={handleCloseDialog}
          />
        </div>
      </CardHeader>
      <CardContent>
        <RulesTable
          rules={rules}
          onEdit={handleEditRule}
          onToggleStatus={toggleRuleStatus}
          onDelete={deleteRule}
        />
      </CardContent>
    </Card>
  );
};

export default RiskRulesManagement;
