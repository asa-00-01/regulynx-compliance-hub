
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code } from 'lucide-react';

interface RuleConditionBuilderProps {
  category: 'transaction' | 'kyc' | 'behavioral';
  conditionField: string;
  setConditionField: (field: string) => void;
  conditionOperator: string;
  setConditionOperator: (operator: string) => void;
  conditionValue: string;
  setConditionValue: (value: string) => void;
  onBuildCondition: () => void;
}

const RuleConditionBuilder: React.FC<RuleConditionBuilderProps> = ({
  category,
  conditionField,
  setConditionField,
  conditionOperator,
  setConditionOperator,
  conditionValue,
  setConditionValue,
  onBuildCondition
}) => {
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
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="field">Field</Label>
          <Select value={conditionField} onValueChange={setConditionField}>
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {getFieldOptions(category).map(option => (
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
      
      <Button onClick={onBuildCondition} className="w-full">
        <Code className="h-4 w-4 mr-2" />
        Build Condition
      </Button>
    </div>
  );
};

export default RuleConditionBuilder;
