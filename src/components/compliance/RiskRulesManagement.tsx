
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Play, Loader2, HelpCircle, Info } from 'lucide-react';
import { useRiskRulesManagement, Rule } from '@/hooks/useRiskRulesManagement';
import { useGlobalRiskAssessment } from '@/hooks/useGlobalRiskAssessment';
import RuleFormDialog from './RuleFormDialog';
import RulesTable from './RulesTable';
import { TooltipHelp } from '@/components/ui/tooltip-custom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RiskRulesManagement: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const {
    rules,
    loading,
    saveRule,
    toggleRuleStatus,
    deleteRule
  } = useRiskRulesManagement(selectedCategory);

  const { runGlobalAssessment, runningAssessment } = useGlobalRiskAssessment();

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
  };

  const handleCloseDialog = () => {
    setEditingRule(null);
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Risk rules automatically evaluate user activities and assign risk scores. Create rules to identify high-risk behaviors, monitor compliance thresholds, and trigger alerts for investigation.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Risk Rules Management
              <TooltipHelp content="Manage automated risk assessment rules that evaluate user behavior, transactions, and compliance factors. Rules help identify potential risks and trigger appropriate actions.">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipHelp>
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <TooltipHelp content="Run a comprehensive risk assessment across all users using the current active rules. This will recalculate risk scores and update user profiles.">
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
            </TooltipHelp>
            <TooltipHelp content="Filter rules by category to focus on specific types of risk assessments: Transaction rules monitor financial activities, KYC rules evaluate customer verification, and Behavioral rules analyze user patterns.">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="transaction">Transaction Rules</SelectItem>
                  <SelectItem value="kyc">KYC Rules</SelectItem>
                  <SelectItem value="behavioral">Behavioral Rules</SelectItem>
                </SelectContent>
              </Select>
            </TooltipHelp>
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
    </div>
  );
};

export default RiskRulesManagement;
