
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Transaction } from '@/types/transaction';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { HIGH_RISK_COUNTRIES } from './mockTransactionData';
import { Button } from '@/components/ui/button';
import { Flag, AlertTriangle } from 'lucide-react';

interface TransactionDetailsProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAlert?: (transaction: Transaction) => void;
}

const TransactionDetails = ({
  transaction,
  open,
  onOpenChange,
  onCreateAlert,
}: TransactionDetailsProps) => {
  if (!transaction) return null;

  const isHighRiskCountry = (country: string) => {
    return HIGH_RISK_COUNTRIES.includes(country);
  };

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

  // Function to get risk color
  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 25) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Transaction Details
            {transaction.flagged && (
              <Badge variant="destructive" className="ml-2">
                Flagged
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Transaction ID: <span className="font-mono">{transaction.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Transaction Info</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Amount</dt>
                    <dd className="text-sm font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </dd>
                  </div>
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
                    <dt className="text-sm text-muted-foreground">Description</dt>
                    <dd className="text-sm font-medium">
                      {transaction.description || 'No description'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">User Details</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">User</dt>
                    <dd className="text-sm font-medium">{transaction.userName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">User ID</dt>
                    <dd className="text-sm font-mono">{transaction.userId}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Countries</h3>
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-muted-foreground">Origin</dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-sm font-medium">{transaction.originCountry}</span>
                    {isHighRiskCountry(transaction.originCountry) && (
                      <Badge variant="destructive">High-Risk</Badge>
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-muted-foreground">Destination</dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-sm font-medium">{transaction.destinationCountry}</span>
                    {isHighRiskCountry(transaction.destinationCountry) && (
                      <Badge variant="destructive">High-Risk</Badge>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className={getRiskColor(transaction.riskScore)}>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{transaction.riskScore}</span>
                  <span className="text-sm">/ 100</span>
                </div>
              </div>

              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${transaction.riskScore}%`,
                    backgroundColor: transaction.riskScore >= 75 ? '#f43f5e' : 
                                    transaction.riskScore >= 50 ? '#eab308' :
                                    transaction.riskScore >= 25 ? '#3b82f6' : '#22c55e'
                  }}
                ></div>
              </div>

              <div className="mt-4">
                {transaction.riskScore >= 75 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle size={16} />
                    <span className="text-sm">High risk transaction</span>
                  </div>
                )}
                {transaction.riskScore >= 50 && transaction.riskScore < 75 && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle size={16} />
                    <span className="text-sm">Medium risk transaction</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {onCreateAlert && !transaction.flagged && (
            <div className="flex justify-end mt-2">
              <Button
                variant="destructive"
                onClick={() => onCreateAlert(transaction)}
                className="flex items-center gap-2"
              >
                <Flag size={16} />
                Flag Transaction
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetails;
