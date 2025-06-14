
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AMLTransaction } from '@/types/aml';

interface TransactionPartiesProps {
  transaction: AMLTransaction;
}

const TransactionParties: React.FC<TransactionPartiesProps> = ({ transaction }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-2">Parties</h3>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-muted-foreground">Sender</dt>
            <dd className="text-sm font-medium mt-1">{transaction.senderName}</dd>
            <dd className="text-xs text-muted-foreground mt-1">ID: {transaction.senderUserId}</dd>
          </div>
          {transaction.receiverName && (
            <div>
              <dt className="text-sm text-muted-foreground">Receiver</dt>
              <dd className="text-sm font-medium mt-1">{transaction.receiverName}</dd>
              {transaction.receiverUserId && (
                <dd className="text-xs text-muted-foreground mt-1">ID: {transaction.receiverUserId}</dd>
              )}
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
};

export default TransactionParties;
