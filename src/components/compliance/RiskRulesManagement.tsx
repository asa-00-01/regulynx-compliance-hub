
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Play, Loader2 } from 'lucide-react';
import { useRiskRulesManagement, Rule } from '@/hooks/useRiskRulesManagement';
import { useGlobalRiskAssessment } from '@/hooks/useGlobalRiskAssessment';
import RuleFormDialog from './RuleFormDialog';
import RulesTable from './RulesTable';

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
