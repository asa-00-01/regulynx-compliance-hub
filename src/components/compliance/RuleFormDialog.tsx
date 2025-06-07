
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Code } from 'lucide-react';
import { Rule, RuleFormData } from '@/hooks/useRiskRulesManagement';
import RuleTemplates, { RuleTemplate } from './RuleTemplates';

interface RuleFormDialogProps {
  editingRule: Rule | null;
  loading: boolean;
  onSave: (ruleData: RuleFormData, editingRule: Rule | null) => Promise<boolean>;
  onClose: () => void;
}

const RuleFormDialog: React.FC<RuleFormDialogProps> = ({
  editingRule,
  loading,
  onSave,
  onClose
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<RuleFormData>({
    rule_name: '',
    description: '',
    category: 'transaction',
    risk_score: 10,
    condition: '{}'
  });

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
    const success = await onSave(formData, editingRule);
    if (success) {
      resetForm();
    }
  };

  const useTemplate = (template: RuleTemplate) => {
    setFormData({
      rule_name: template.name,
      description: template.description,
      category: template.category,
      risk_score: template.risk_score,
      condition: JSON.stringify(template.condition, null, 2)
    });
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

  const getFieldOptions = (category: string) => {
    switch (category) {
      case 'transaction':
        return [
          { value: 'amount', label: 'Transaction Amount' },
          { value: 'sender_country', label: 'Sender Country' },
          { value: 'receiver_country', label: 'Receiver Country' },
          { value: 'transaction_hour', label: 'Transaction Hour' },
          { value: 'frequency_24h', label: '24h Frequency' },
          { value: 'amount_7d', label: '7-day Volume' },
        ];
      case 'kyc':
        return [
          { value: 'kyc_completion', label: 'KYC Completion %' },
          { value: 'is_pep', label: 'Is PEP' },
          { value: 'sanctions_match', label: 'Sanctions Match' },
          { value: 'age', label: 'User Age' },
        ];
      case 'behavioral':
        return [
          { value: 'frequency_24h', label: '24h Transaction Frequency' },
          { value: 'failed_logins_24h', label: '24h Failed Logins' },
          { value: 'transactions_5min', label: '5min Transaction Count' },
          { value: 'monthly_volume', label: 'Monthly Volume' },
        ];
      default:
        return [];
    }
  };

  const operatorOptions = [
    { value: '>', label: 'Greater than (>)' },
    { value: '<', label: 'Less than (<)' },
    { value: '>=', label: 'Greater than or equal (>=)' },
    { value: '<=', label: 'Less than or equal (<=)' },
    { value: '==', label: 'Equal to (==)' },
    { value: '!=', label: 'Not equal to (!=)' },
    { value: 'in', label: 'In array (in)' },
  ];

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingRule ? 'Edit Rule' : 'Create New Rule'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="builder">Condition Builder</TabsTrigger>
            <TabsTrigger value="advanced">Advanced JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {!editingRule && (
              <RuleTemplates onUseTemplate={useTemplate} />
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule_name">Rule Name</Label>
                <Input
                  id="rule_name"
                  value={formData.rule_name}
                  onChange={(e) => setFormData({...formData, rule_name: e.target.value})}
                  placeholder="Enter rule name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: 'transaction' | 'kyc' | 'behavioral') => 
                    setFormData({...formData, category: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transaction">Transaction</SelectItem>
                    <SelectItem value="kyc">KYC</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter rule description"
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="risk_score">Risk Score (1-100)</Label>
              <Input
                id="risk_score"
                type="number"
                min="1"
                max="100"
                value={formData.risk_score}
                onChange={(e) => setFormData({...formData, risk_score: parseInt(e.target.value) || 10})}
              />
            </div>
          </TabsContent>

          <TabsContent value="builder" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="field">Field</Label>
                <Select value={conditionField} onValueChange={setConditionField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFieldOptions(formData.category).map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="operator">Operator</Label>
                <Select value={conditionOperator} onValueChange={setConditionOperator}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                  placeholder={conditionOperator === 'in' ? '["US", "GB"]' : '100'}
                />
              </div>
            </div>
            
            <Button onClick={buildCondition} className="w-full">
              <Code className="h-4 w-4 mr-2" />
              Build Condition
            </Button>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label htmlFor="condition">Condition (JSON Logic)</Label>
              <Textarea
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                placeholder='{"operator": [{"var": "field"}, value]}'
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use JSON Logic format. Example: {`{">":[{"var":"amount"},10000]}`}
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {editingRule ? 'Update Rule' : 'Create Rule'}
          </Button>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RuleFormDialog;
