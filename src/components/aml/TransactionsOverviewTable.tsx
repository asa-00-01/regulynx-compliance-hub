
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
import { Eye, Flag, FileText } from 'lucide-react';
import { AMLTransaction, HIGH_RISK_COUNTRIES } from '@/types/aml';
import { formatCurrency } from '@/lib/utils';
import RiskBadge from '../common/RiskBadge';

interface TransactionsOverviewTableProps {
  transactions: AMLTransaction[];
  onViewDetails: (transaction: AMLTransaction) => void;
  onFlagTransaction: (transaction: AMLTransaction) => void;
  onCreateCase: (transaction: AMLTransaction) => void;
}

const TransactionsOverviewTable = ({ 
  transactions,
  onViewDetails,
  onFlagTransaction,
  onCreateCase
}: TransactionsOverviewTableProps) => {
  const isHighRiskCountry = (countryCode: string) => {
    return HIGH_RISK_COUNTRIES.some(country => 
      country.countryCode === countryCode && 
      country.riskLevel === 'high'
    );
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Sender</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Countries</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow 
                key={transaction.id}
                className={transaction.isSuspect ? "bg-red-50/30" : ""}
              >
                <TableCell className="font-mono text-xs">
                  {transaction.id.substring(0, 8)}...
                </TableCell>
                <TableCell>{transaction.senderName}</TableCell>
                <TableCell>
                  {formatCurrency(transaction.senderAmount, transaction.senderCurrency)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge 
                      variant={isHighRiskCountry(transaction.senderCountryCode) ? "destructive" : "outline"}
                      className="w-fit"
                    >
                      {transaction.senderCountryCode}
                    </Badge>
                    <Badge 
                      variant={isHighRiskCountry(transaction.receiverCountryCode) ? "destructive" : "outline"}
                      className="w-fit"
                    >
                      {transaction.receiverCountryCode}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{transaction.reasonForSending}</span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      transaction.status === 'flagged' ? "warning" :
                      transaction.status === 'failed' ? "destructive" :
                      transaction.status === 'completed' ? "default" : "secondary"
                    }
                  >
                    {transaction.status}
                  </Badge>
                  {transaction.isSuspect && (
                    <Badge variant="destructive" className="ml-2">Suspect</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <RiskBadge score={transaction.riskScore} showText={false} />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewDetails(transaction)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => onFlagTransaction(transaction)}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      Flag
                    </Button>
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => onCreateCase(transaction)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Case
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionsOverviewTable;
