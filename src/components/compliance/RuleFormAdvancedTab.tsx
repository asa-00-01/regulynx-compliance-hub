
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RuleFormData } from '@/hooks/useRiskRulesManagement';

interface RuleFormAdvancedTabProps {
  formData: RuleFormData;
  setFormData: (data: RuleFormData) => void;
}

const RuleFormAdvancedTab: React.FC<RuleFormAdvancedTabProps> = ({
  formData,
  setFormData
}) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default RuleFormAdvancedTab;
