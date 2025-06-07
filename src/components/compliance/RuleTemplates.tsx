
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

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
    description: 'Flags transactions above $10,000',
    risk_score: 30,
    condition: { '>': [{ var: 'amount' }, 10000] }
  },
  {
    name: 'Very High Amount Transaction',
    category: 'transaction',
    description: 'Flags transactions above $50,000',
    risk_score: 50,
    condition: { '>': [{ var: 'amount' }, 50000] }
  },
  {
    name: 'High Risk Country Transaction',
    category: 'transaction',
    description: 'Flags transactions from high-risk countries',
    risk_score: 40,
    condition: { 'in': [{ var: 'sender_country' }, ['AF', 'IR', 'KP', 'SY', 'IQ']] }
  },
  {
    name: 'Night Time Transactions',
    category: 'behavioral',
    description: 'Flags transactions during unusual hours (2-6 AM)',
    risk_score: 20,
    condition: { 'and': [{ '>=': [{ var: 'transaction_hour' }, 2] }, { '<=': [{ var: 'transaction_hour' }, 6] }] }
  },
  {
    name: 'Frequent Transactions',
    category: 'behavioral',
    description: 'Flags users with more than 5 transactions in 24 hours',
    risk_score: 25,
    condition: { '>': [{ var: 'frequency_24h' }, 5] }
  },
  {
    name: 'Rapid Fire Transactions',
    category: 'behavioral',
    description: 'Flags multiple transactions within 5 minutes',
    risk_score: 35,
    condition: { '>': [{ var: 'transactions_5min' }, 3] }
  },
  {
    name: 'High Weekly Volume',
    category: 'behavioral',
    description: 'Flags users with high 7-day transaction volume',
    risk_score: 30,
    condition: { '>': [{ var: 'amount_7d' }, 100000] }
  },
  {
    name: 'Incomplete KYC',
    category: 'kyc',
    description: 'Flags users with incomplete KYC verification',
    risk_score: 45,
    condition: { '<': [{ var: 'kyc_completion' }, 100] }
  },
  {
    name: 'PEP Detection',
    category: 'kyc',
    description: 'Flags Politically Exposed Persons',
    risk_score: 60,
    condition: { '==': [{ var: 'is_pep' }, true] }
  },
  {
    name: 'Sanctions Match',
    category: 'kyc',
    description: 'Flags users with sanctions matches',
    risk_score: 80,
    condition: { '==': [{ var: 'sanctions_match' }, true] }
  },
  {
    name: 'Underage User',
    category: 'kyc',
    description: 'Flags users under 18 years old',
    risk_score: 50,
    condition: { '<': [{ var: 'age' }, 18] }
  },
  {
    name: 'Multiple Failed Logins',
    category: 'behavioral',
    description: 'Flags users with multiple failed login attempts',
    risk_score: 25,
    condition: { '>': [{ var: 'failed_logins_24h' }, 10] }
  }
];

interface RuleTemplatesProps {
  onUseTemplate: (template: RuleTemplate) => void;
}

const RuleTemplates: React.FC<RuleTemplatesProps> = ({ onUseTemplate }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transaction': return 'bg-blue-100 text-blue-800';
      case 'kyc': return 'bg-purple-100 text-purple-800';
      case 'behavioral': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 60) return 'bg-red-100 text-red-800';
    if (riskScore >= 40) return 'bg-orange-100 text-orange-800';
    if (riskScore >= 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div>
      <Label>Quick Templates</Label>
      <div className="grid grid-cols-1 gap-2 mt-2 max-h-60 overflow-y-auto">
        {ruleTemplates.map((template, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onUseTemplate(template)}
            className="justify-start text-left h-auto p-3"
          >
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium">{template.name}</div>
                <div className="flex gap-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getCategoryColor(template.category)}`}
                  >
                    {template.category}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getRiskColor(template.risk_score)}`}
                  >
                    {template.risk_score}
                  </Badge>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {template.description}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RuleTemplates;
export type { RuleTemplate };
