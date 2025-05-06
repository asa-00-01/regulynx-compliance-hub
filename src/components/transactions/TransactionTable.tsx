
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
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils';
import { HIGH_RISK_COUNTRIES } from './mockTransactionData';

interface TransactionTableProps {
  transactions: Transaction[];
  onViewTransaction?: (transaction: Transaction) => void;
}

const TransactionTable = ({ transactions, onViewTransaction }: TransactionTableProps) => {
  // Function to get badge variant based on risk score
  const getRiskBadgeVariant = (score: number) => {
    if (score >= 75) return "destructive";
    if (score >= 50) return "warning";
    if (score >= 25) return "secondary";
    return "outline";
  };

  // Function to get country badge variant
  const getCountryBadgeVariant = (country: string) => {
    return HIGH_RISK_COUNTRIES.includes(country) ? "destructive" : "outline";
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="border rounded-md">
      <div className="max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Countries</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Risk Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewTransaction?.(transaction)}
                >
                  <TableCell className="font-mono text-xs">
                    {transaction.id}
                  </TableCell>
                  <TableCell>{transaction.userName}</TableCell>
                  <TableCell>
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(transaction.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={getCountryBadgeVariant(transaction.originCountry)} className="w-fit">
                        {transaction.originCountry}
                      </Badge>
                      <Badge variant={getCountryBadgeVariant(transaction.destinationCountry)} className="w-fit">
                        {transaction.destinationCountry}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {transaction.method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(transaction.riskScore)}>
                      {transaction.riskScore}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
