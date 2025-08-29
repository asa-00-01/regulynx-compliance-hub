
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Eye, 
  Flag, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Download
} from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  onViewTransaction: (transaction: Transaction) => void;
  onUpdateStatus: (transactionId: string, status: 'pending' | 'approved' | 'rejected' | 'flagged') => Promise<boolean>;
  onExport: () => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading = false,
  onViewTransaction,
  onUpdateStatus,
  onExport,
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onNextPage,
  onPrevPage,
  hasNextPage,
  hasPrevPage
}) => {
  const { t } = useTranslation();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'flagged':
        return 'destructive';
      case 'rejected':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 80) return 'destructive';
    if (score >= 50) return 'secondary';
    return 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleStatusUpdate = async (transactionId: string, newStatus: 'pending' | 'approved' | 'rejected' | 'flagged') => {
    setUpdatingStatus(transactionId);
    try {
      await onUpdateStatus(transactionId, newStatus);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailDialogOpen(true);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('transactions.recentTransactions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading transactions...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('transactions.recentTransactions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Transactions Found</h3>
              <p className="text-sm text-muted-foreground">
                No transactions match the current filters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('transactions.recentTransactions')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{endIndex} of {totalItems} transactions
              </p>
            </div>
            <Button variant="outline" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              {t('common.export')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <div className="flex items-center gap-1">
                      {t('transactions.id')}
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>{t('transactions.user')}</TableHead>
                  <TableHead>{t('transactions.amount')}</TableHead>
                  <TableHead>{t('transactions.type')}</TableHead>
                  <TableHead>{t('transactions.status')}</TableHead>
                  <TableHead>{t('transactions.riskScore')}</TableHead>
                  <TableHead>{t('transactions.date')}</TableHead>
                  <TableHead className="w-[100px]">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs">
                      {transaction.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.userName}</div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.externalId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                      {transaction.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {transaction.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {transaction.method.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        <Badge variant={getStatusBadgeVariant(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(transaction.riskScore)}>
                        {transaction.riskScore}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(transaction.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewTransaction(transaction)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{endIndex} of {totalItems} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevPage}
                  disabled={!hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(page)}
                        className="w-8 h-8"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNextPage}
                  disabled={!hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information about transaction {selectedTransaction?.id.substring(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Transaction ID</label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedTransaction.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">External ID</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.externalId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">User</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.userName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedTransaction.method.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTransaction.status)}
                    <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Risk Score</label>
                  <Badge variant={getRiskBadgeVariant(selectedTransaction.riskScore)}>
                    {selectedTransaction.riskScore}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedTransaction.timestamp)}
                  </p>
                </div>
              </div>

              {selectedTransaction.description && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.description}
                  </p>
                </div>
              )}

              {selectedTransaction.fromAccount && selectedTransaction.toAccount && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">From Account</label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {selectedTransaction.fromAccount}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">To Account</label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {selectedTransaction.toAccount}
                    </p>
                  </div>
                </div>
              )}

              {selectedTransaction.flags && selectedTransaction.flags.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Flags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTransaction.flags.map((flag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update Actions */}
              <div className="flex gap-2 pt-4 border-t">
                                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => handleStatusUpdate(selectedTransaction.id, 'approved')}
                   disabled={updatingStatus === selectedTransaction.id}
                 >
                   <CheckCircle className="h-4 w-4 mr-1" />
                   Mark Approved
                 </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedTransaction.id, 'flagged')}
                  disabled={updatingStatus === selectedTransaction.id}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Flag
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewTransaction(selectedTransaction)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View in AML
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionTable;
