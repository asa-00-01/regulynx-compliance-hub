
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { AMLTransaction, HIGH_RISK_COUNTRIES } from '@/types/aml';
import { Flag, FileText, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RiskBadge from '../common/RiskBadge';

interface TransactionDetailsModalProps {
  transaction: AMLTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlag: (transaction: AMLTransaction) => void;
  onCreateCase: (transaction: AMLTransaction) => void;
}

const TransactionDetailsModal = ({
  transaction,
  open,
  onOpenChange,
  onFlag,
  onCreateCase,
}: TransactionDetailsModalProps) => {
  if (!transaction) return null;

  const isHighRiskCountry = (countryCode: string) => {
    return HIGH_RISK_COUNTRIES.some(country => 
      country.countryCode === countryCode && 
      country.riskLevel === 'high'
    );
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Transaction Details
            {transaction.status === 'flagged' && (
              <Badge variant="destructive" className="ml-2">
                Flagged
              </Badge>
            )}
            {transaction.isSuspect && (
              <Badge variant="warning" className="ml-2">
                Suspect
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
          </div>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Countries</h3>
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-muted-foreground">Sender Country</dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-sm font-medium">{transaction.senderCountryCode}</span>
                    {isHighRiskCountry(transaction.senderCountryCode) && (
                      <Badge variant="destructive">High-Risk</Badge>
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-muted-foreground">Receiver Country</dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-sm font-medium">{transaction.receiverCountryCode}</span>
                    {isHighRiskCountry(transaction.receiverCountryCode) && (
                      <Badge variant="destructive">High-Risk</Badge>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Score</span>
                <div className="flex items-center gap-2">
                  <RiskBadge score={transaction.riskScore} />
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

              {transaction.notes && transaction.notes.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Notes</h4>
                  <ul className="space-y-2">
                    {transaction.notes.map((note, index) => (
                      <li key={index} className="text-sm bg-muted p-2 rounded">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
                
              {transaction.riskScore >= 75 && (
                <div className="mt-4 flex items-center gap-2 text-red-600">
                  <AlertTriangle size={16} />
                  <span className="text-sm">High risk transaction</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 mt-2">
            <Button
              variant="outline"
              onClick={() => onFlag(transaction)}
              className="flex items-center gap-2"
            >
              <Flag size={16} />
              Flag Transaction
            </Button>
            <Button
              variant="default"
              onClick={() => onCreateCase(transaction)}
              className="flex items-center gap-2"
            >
              <FileText size={16} />
              Create Case
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;
