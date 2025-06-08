
import { useState, useEffect } from 'react';
import { Rule, RuleFormData } from '@/hooks/useRiskRulesManagement';
import { useToast } from '@/hooks/use-toast';

export function useRuleForm(
  editingRule: Rule | null,
  onSave: (ruleData: RuleFormData, editingRule: Rule | null) => Promise<boolean>,
  onClose: () => void
) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<RuleFormData>({
    rule_name: '',
    description: '',
    category: 'transaction',
    risk_score: 10,
    condition: '{}'
  });
  const { toast } = useToast();

  // Condition builder state
  const [conditionField, setConditionField] = useState('');
  const [conditionOperator, setConditionOperator] = useState('>');
  const [conditionValue, setConditionValue] = useState('');

  useEffect(() => {
    if (editingRule) {
      setFormData({
        rule_name: editingRule.rule_name,
        description: editingRule.description,
        category: editingRule.category,
        risk_score: editingRule.risk_score,
        condition: JSON.stringify(editingRule.condition, null, 2)
      });
      setDialogOpen(true);
    }
  }, [editingRule]);

  const resetForm = () => {
    setFormData({
      rule_name: '',
      description: '',
      category: 'transaction',
      risk_score: 10,
      condition: '{}'
    });
    setConditionField('');
    setConditionOperator('>');
    setConditionValue('');
    setActiveTab('basic');
    setDialogOpen(false);
    onClose();
  };

  const handleSave = async () => {
    if (!formData.rule_name.trim()) {
      toast({
        title: 'Error',
        description: 'Rule name is required',
        variant: 'destructive'
      });
      return;
    }

    const success = await onSave(formData, editingRule);
    if (success) {
      resetForm();
    }
  };

  const buildCondition = () => {
    if (!conditionField || !conditionValue) return;

    let value: any = conditionValue;
    
    // Try to parse as number
    if (!isNaN(Number(conditionValue))) {
      value = Number(conditionValue);
    }
    
    // Handle array values for 'in' operator
    if (conditionOperator === 'in') {
      try {
        value = JSON.parse(conditionValue);
      } catch {
        value = conditionValue.split(',').map(v => v.trim());
      }
    }

    const condition = {
      [conditionOperator]: [
        { var: conditionField },
        value
      ]
    };

    setFormData({
      ...formData,
      condition: JSON.stringify(condition, null, 2)
    });
    setActiveTab('advanced');
  };

  return {
    dialogOpen,
    setDialogOpen,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    conditionField,
    setConditionField,
    conditionOperator,
    setConditionOperator,
    conditionValue,
    setConditionValue,
    resetForm,
    handleSave,
    buildCondition
  };
}
