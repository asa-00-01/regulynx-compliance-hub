
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RuleFormData, Rule } from '@/hooks/useRiskRulesManagement';
import RuleTemplates, { RuleTemplate } from './RuleTemplates';

interface RuleFormBasicTabProps {
  formData: RuleFormData;
  setFormData: (data: RuleFormData) => void;
  editingRule: Rule | null;
}

const RuleFormBasicTab: React.FC<RuleFormBasicTabProps> = ({
  formData,
  setFormData,
  editingRule
}) => {
  const useTemplate = (template: RuleTemplate) => {
    setFormData({
      rule_name: template.name,
      description: template.description,
      category: template.category,
      risk_score: template.risk_score,
      condition: JSON.stringify(template.condition, null, 2)
    });
  };

  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default RuleFormBasicTab;
