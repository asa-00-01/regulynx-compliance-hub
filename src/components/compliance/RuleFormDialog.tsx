
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
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
  const [formData, setFormData] = useState<RuleFormData>({
    rule_name: '',
    description: '',
    category: 'transaction',
    risk_score: 10,
    condition: '{}'
  });

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

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingRule ? 'Edit Rule' : 'Create New Rule'}
          </DialogTitle>
        </DialogHeader>
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
          
          <div>
            <Label htmlFor="condition">Condition (JSON Logic)</Label>
            <Textarea
              id="condition"
              value={formData.condition}
              onChange={(e) => setFormData({...formData, condition: e.target.value})}
              placeholder='{"operator": [{"var": "field"}, value]}'
              rows={4}
              className="font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RuleFormDialog;
