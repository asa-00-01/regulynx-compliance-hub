
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TransactionsOverviewTable from './TransactionsOverviewTable';
import { AMLTransaction } from '@/types/aml';

interface AMLTransactionTableSectionProps {
  filteredTransactions: AMLTransaction[];
  onViewDetails: (transaction: AMLTransaction) => void;
  onFlagTransaction: (transaction: AMLTransaction) => void;
  onCreateCase: (transaction: AMLTransaction) => void;
  showUserColumn: boolean;
}

const AMLTransactionTableSection: React.FC<AMLTransactionTableSectionProps> = ({
  filteredTransactions,
  onViewDetails,
  onFlagTransaction,
  onCreateCase,
  showUserColumn,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AML Transaction Monitoring</CardTitle>
        <CardDescription>
          Review transactions for suspicious activity and compliance violations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TransactionsOverviewTable
          transactions={filteredTransactions}
          onViewDetails={onViewDetails}
          onFlagTransaction={onFlagTransaction}
          onCreateCase={onCreateCase}
          showUserColumn={showUserColumn}
        />
      </CardContent>
    </Card>
  );
};

export default AMLTransactionTableSection;
