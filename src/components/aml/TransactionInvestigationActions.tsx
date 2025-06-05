
import React from 'react';
import { Button } from '@/components/ui/button';
import { AMLTransaction } from '@/types/aml';

interface TransactionInvestigationActionsProps {
  transaction: AMLTransaction;
  loading: string | null;
  onViewUserTransactions: () => void;
}

const TransactionInvestigationActions: React.FC<TransactionInvestigationActionsProps> = ({
  transaction,
  loading,
  onViewUserTransactions,
}) => {
  return (
    <div className="border-t pt-4">
      <h4 className="text-sm font-medium mb-3">Investigation</h4>
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewUserTransactions}
          disabled={loading === 'transactions'}
          className="w-full justify-start"
        >
          View All User Transactions
        </Button>
      </div>
    </div>
  );
};

export default TransactionInvestigationActions;
