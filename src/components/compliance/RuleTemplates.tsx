
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface RuleTemplate {
  name: string;
  category: 'transaction' | 'kyc' | 'behavioral';
  description: string;
  risk_score: number;
  condition: any;
}

const ruleTemplates: RuleTemplate[] = [
  {
    name: 'High Amount Transaction',
    category: 'transaction',
    description: 'Flags transactions above a certain amount threshold',
    risk_score: 30,
    condition: { '>': [{ var: 'amount' }, 10000] }
  },
  {
    name: 'Frequent Transactions',
    category: 'behavioral',
    description: 'Flags users with high transaction frequency in 24 hours',
    risk_score: 25,
    condition: { '>': [{ var: 'frequency_24h' }, 5] }
  },
  {
    name: 'Incomplete KYC',
    category: 'kyc',
    description: 'Flags users with incomplete KYC verification',
    risk_score: 40,
    condition: { '<': [{ var: 'kyc_completion' }, 100] }
  },
  {
    name: 'High Risk Country',
    category: 'transaction',
    description: 'Flags transactions from high-risk countries',
    risk_score: 35,
    condition: { 'in': [{ var: 'country' }, ['AF', 'IR', 'KP', 'SY']] }
  },
  {
    name: 'Night Time Transactions',
    category: 'behavioral',
    description: 'Flags transactions during unusual hours (2-6 AM)',
    risk_score: 15,
    condition: { 'and': [{ '>=': [{ var: 'transaction_hour' }, 2] }, { '<=': [{ var: 'transaction_hour' }, 6] }] }
  }
];

interface RuleTemplatesProps {
  onUseTemplate: (template: RuleTemplate) => void;
}

const RuleTemplates: React.FC<RuleTemplatesProps> = ({ onUseTemplate }) => {
  return (
    <div>
      <Label>Quick Templates</Label>
      <div className="grid grid-cols-1 gap-2 mt-2">
        {ruleTemplates.map((template, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onUseTemplate(template)}
            className="justify-start text-left h-auto p-3"
          >
            <div>
              <div className="font-medium">{template.name}</div>
              <div className="text-xs text-muted-foreground">{template.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RuleTemplates;
export type { RuleTemplate };
