
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AMLTransaction } from '@/types/aml';
import { Flag, AlertTriangle, FileText, User, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TransactionActionsProps {
  transaction: AMLTransaction;
  onActionTaken?: () => void;
}

const TransactionActions: React.FC<TransactionActionsProps> = ({ transaction, onActionTaken }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFlagTransaction = async () => {
    setLoading('flag');
    try {
      // In a real app, this would update the transaction status in the database
      toast({
        title: 'Transaction Flagged',
        description: `Transaction ${transaction.id.substring(0, 8)}... has been flagged for review`,
        variant: 'destructive',
      });
      onActionTaken?.();
    } finally {
      setLoading(null);
    }
  };

  const handleCreateCase = async () => {
    setLoading('case');
    try {
      navigate('/compliance-cases', {
        state: {
          createCase: true,
          userData: {
            userId: transaction.senderUserId,
            userName: transaction.senderName,
            description: `Suspicious transaction: ${transaction.id} - Amount: ${transaction.senderAmount} ${transaction.senderCurrency}`,
            type: 'aml',
            source: 'transaction_alert',
            riskScore: transaction.riskScore,
          }
        }
      });

      toast({
        title: 'Case Created',
        description: 'AML investigation case has been initiated',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleCreateSAR = async () => {
    setLoading('sar');
    try {
      navigate('/sar-center', {
        state: {
          createSAR: true,
          transactionData: transaction
        }
      });

      toast({
        title: 'SAR Creation',
        description: 'Navigating to create Suspicious Activity Report',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleViewUserProfile = async () => {
    setLoading('profile');
    try {
      navigate(`/user-case/${transaction.senderUserId}`);
      toast({
        title: 'User Profile',
        description: `Opening profile for ${transaction.senderName}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleViewUserTransactions = async () => {
    setLoading('transactions');
    try {
      navigate(`/aml-monitoring?userId=${transaction.senderUserId}`);
      toast({
        title: 'User Transactions',
        description: `Viewing all transactions for ${transaction.senderName}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const getRiskLevelColor = () => {
    if (transaction.riskScore >= 75) return 'destructive';
    if (transaction.riskScore >= 50) return 'warning';
    if (transaction.riskScore >= 25) return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Transaction Actions
          </span>
          <Badge variant={getRiskLevelColor()}>
            Risk Score: {transaction.riskScore}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Immediate Actions */}
        <div className="grid grid-cols-2 gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Flag className="h-4 w-4" />
                Flag Transaction
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Flag Transaction</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to flag this transaction as suspicious? 
                  This will mark it for immediate compliance review.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleFlagTransaction}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Flag Transaction
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateCase}
            disabled={loading === 'case'}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Create Case
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateSAR}
            disabled={loading === 'sar'}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Create SAR
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleViewUserProfile}
            disabled={loading === 'profile'}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            User Profile
          </Button>
        </div>

        {/* Investigation Actions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Investigation</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewUserTransactions}
              disabled={loading === 'transactions'}
              className="w-full justify-start"
            >
              View All User Transactions
            </Button>
          </div>
        </div>

        {/* Transaction Details Summary */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Transaction Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium">
                {transaction.senderAmount.toLocaleString()} {transaction.senderCurrency}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Method:</span>
              <Badge variant="outline" size="sm">
                {transaction.method}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge 
                variant={transaction.isSuspect ? 'destructive' : 'default'} 
                size="sm"
              >
                {transaction.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Corridor:</span>
              <span className="text-xs">
                {transaction.senderCountryCode} → {transaction.receiverCountryCode}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionActions;
