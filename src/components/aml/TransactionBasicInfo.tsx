
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { AMLTransaction } from '@/types/aml';

interface TransactionBasicInfoProps {
  transaction: AMLTransaction;
}

const TransactionBasicInfo: React.FC<TransactionBasicInfoProps> = ({ transaction }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-2">Transaction Info</h3>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-sm text-muted-foreground">Sender Amount</dt>
            <dd className="text-sm font-medium">
              {formatCurrency(transaction.senderAmount, transaction.senderCurrency)}
            </dd>
          </div>
          {transaction.receiverAmount && transaction.receiverCurrency && (
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Receiver Amount</dt>
              <dd className="text-sm font-medium">
                {formatCurrency(transaction.receiverAmount, transaction.receiverCurrency)}
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-sm text-muted-foreground">Date & Time</dt>
            <dd className="text-sm font-medium">
              {formatDate(transaction.timestamp)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-muted-foreground">Method</dt>
            <dd className="text-sm font-medium capitalize">
              {transaction.method}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-muted-foreground">Reason</dt>
            <dd className="text-sm font-medium capitalize">
              {transaction.reasonForSending}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-muted-foreground">Status</dt>
            <dd className="text-sm font-medium">
              <Badge 
                variant={
                  transaction.status === 'flagged' ? "warning" :
                  transaction.status === 'failed' ? "destructive" :
                  transaction.status === 'completed' ? "default" : "secondary"
                }
              >
                {transaction.status}
              </Badge>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default TransactionBasicInfo;
