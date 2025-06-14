
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AMLTransaction } from '@/types/aml';
import { DetectedPattern } from '@/types/pattern';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle, TrendingUp, Clock, Search, Eye, Flag, FileText } from 'lucide-react';
import RiskBadge from '../common/RiskBadge';

interface PatternDetailsModalProps {
  pattern: DetectedPattern | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewTransaction: (transaction: AMLTransaction) => void;
  onFlagTransaction: (transaction: AMLTransaction) => void;
  onCreateCase: (transaction: AMLTransaction) => void;
}

const PatternDetailsModal: React.FC<PatternDetailsModalProps> = ({
  pattern,
  open,
  onOpenChange,
  onViewTransaction,
  onFlagTransaction,
  onCreateCase,
}) => {
  if (!pattern) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'structuring':
        return <TrendingUp className="h-5 w-5" />;
      case 'high_risk_corridor':
        return <AlertTriangle className="h-5 w-5" />;
      case 'time_pattern':
        return <Clock className="h-5 w-5" />;
      case 'velocity':
        return <Search className="h-5 w-5" />;
      default:
        return <Search className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const totalAmount = pattern.transactions.reduce((sum, tx) => sum + tx.senderAmount, 0);
  const averageRiskScore = pattern.transactions.reduce((sum, tx) => sum + tx.riskScore, 0) / pattern.transactions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getCategoryIcon(pattern.category)}
            {pattern.name}
            <Badge variant={getSeverityColor(pattern.severity)} className="ml-2">
              {pattern.severity}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {pattern.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pattern Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                    <p className="text-2xl font-bold">{pattern.matchCount}</p>
                  </div>
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalAmount, 'USD')}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Risk Score</p>
                    <p className="text-2xl font-bold">{Math.round(averageRiskScore)}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Detected</p>
                    <p className="text-sm font-bold">
                      {new Date(pattern.lastDetected).toLocaleDateString()}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Matching Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Matching Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pattern.transactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className={transaction.isSuspect ? "bg-red-50/30" : undefined}
                      >
                        <TableCell className="font-medium font-mono">
                          {transaction.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{transaction.senderName}</TableCell>
                        <TableCell>
                          {formatCurrency(transaction.senderAmount, transaction.senderCurrency)}
                        </TableCell>
                        <TableCell>{transaction.receiverCountryCode}</TableCell>
                        <TableCell>
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <RiskBadge score={transaction.riskScore} />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewTransaction(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={transaction.isSuspect ? "default" : "outline"}
                              size="sm"
                              onClick={() => onFlagTransaction(transaction)}
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => onCreateCase(transaction)}
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
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatternDetailsModal;
