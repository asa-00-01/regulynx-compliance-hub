
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

      // Run assessments for all users
      for (const user of state.users) {
        try {
          totalAssessments++;
          await evaluateUserRisk(user);
          successfulAssessments++;
        } catch (error) {
          console.error(`Error assessing user ${user.id}:`, error);
        }
      }

      // Mock transaction data for demonstration
      const mockTransactions = [
        {
          id: 'tx_001',
          senderUserId: 'user_001',
          receiverUserId: 'user_002',
          senderAmount: 15000,
          receiverAmount: 14850,
          senderCurrency: 'USD',
          receiverCurrency: 'USD',
          senderCountryCode: 'US',
          receiverCountryCode: 'GB',
          method: 'bank_transfer',
          timestamp: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: 'tx_002',
          senderUserId: 'user_003',
          receiverUserId: 'user_004',
          senderAmount: 50000,
          receiverAmount: 49500,
          senderCurrency: 'USD',
          receiverCurrency: 'USD',
          senderCountryCode: 'AF',
          receiverCountryCode: 'US',
          method: 'crypto',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (night time)
          status: 'completed'
        }
      ];

      // Run assessments for mock transactions
      for (const transaction of mockTransactions) {
        try {
          totalAssessments++;
          await evaluateTransactionRisk(transaction);
          successfulAssessments++;
        } catch (error) {
          console.error(`Error assessing transaction ${transaction.id}:`, error);
        }
      }

      toast({
        title: 'Assessment Complete',
        description: `Successfully assessed ${successfulAssessments} out of ${totalAssessments} entities`,
      });
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
            {runningAssessment ? 'Running Assessment...' : 'Run Assessment'}
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
