
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AMLTransaction } from '@/types/aml';

interface TransactionSummaryProps {
  transaction: AMLTransaction;
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ transaction }) => {
  return (
    <div className="border-t pt-4">
      <h4 className="text-sm font-medium mb-3">Transaction Summary</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span>Amount:</span>
          <span className="font-medium">
            {transaction.senderAmount.toLocaleString()} {transaction.senderCurrency}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Method:</span>
          <Badge variant="outline" size="sm">
            {transaction.method}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Status:</span>
          <Badge 
            variant={transaction.isSuspect ? 'destructive' : 'default'} 
            size="sm"
          >
            {transaction.status}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Corridor:</span>
          <span className="text-xs">
            {transaction.senderCountryCode} → {transaction.receiverCountryCode}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
