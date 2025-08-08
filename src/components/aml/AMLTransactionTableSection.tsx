
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AMLTransaction } from '@/types/aml';
import { Eye, Flag, FileText, AlertTriangle } from 'lucide-react';

interface AMLTransactionTableSectionProps {
  transactions: AMLTransaction[];
  onViewTransaction: (transaction: AMLTransaction) => void;
  onFlagTransaction: (transaction: AMLTransaction) => void;
  onCreateCase: (transaction: AMLTransaction) => void;
  loading?: boolean;
}

const AMLTransactionTableSection: React.FC<AMLTransactionTableSectionProps> = ({
  transactions,
  onViewTransaction,
  onFlagTransaction,
  onCreateCase,
  loading = false
}) => {
  const getRiskBadgeVariant = (riskScore: number) => {
    if (riskScore >= 75) return 'destructive';
    if (riskScore >= 50) return 'default';
    if (riskScore >= 25) return 'secondary';
    return 'outline';
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading transactions...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No Transactions Found</h3>
          <p className="text-sm text-muted-foreground">
            No transactions match the current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Sender</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-mono text-sm">
                {transaction.id.substring(0, 8)}...
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{transaction.senderName}</div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.senderCountry}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{transaction.receiverName}</div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.receiverCountry}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {formatCurrency(transaction.senderAmount, transaction.senderCurrency)}
                  </div>
                  {transaction.senderCurrency !== transaction.receiverCurrency && (
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(transaction.receiverAmount, transaction.receiverCurrency)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatDate(transaction.timestamp)}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getRiskBadgeVariant(transaction.riskScore)}>
                  {transaction.riskScore}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {transaction.status === 'flagged' && (
                    <Badge variant="destructive" className="text-xs">
                      Flagged
                    </Badge>
                  )}
                  {transaction.isSuspect && (
                    <Badge variant="outline" className="text-xs">
                      Suspect
                    </Badge>
                  )}
                  {transaction.status === 'normal' && (
                    <Badge variant="secondary" className="text-xs">
                      Normal
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewTransaction(transaction)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFlagTransaction(transaction)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCreateCase(transaction)}
                    className="h-8 w-8 p-0"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AMLTransactionTableSection;
