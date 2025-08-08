
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AMLTransaction } from '@/types/aml';
import { Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import TransactionActionButtons from './TransactionActionButtons';
import TransactionInvestigationActions from './TransactionInvestigationActions';
import TransactionSummary from './TransactionSummary';

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
    if (transaction.riskScore >= 50) return 'default';
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
        <TransactionActionButtons
          transaction={transaction}
          loading={loading}
          onFlagTransaction={handleFlagTransaction}
          onCreateCase={handleCreateCase}
          onCreateSAR={handleCreateSAR}
          onViewUserProfile={handleViewUserProfile}
        />

        <TransactionInvestigationActions
          transaction={transaction}
          loading={loading}
          onViewUserTransactions={handleViewUserTransactions}
        />

        <TransactionSummary transaction={transaction} />
      </CardContent>
    </Card>
  );
};

export default TransactionActions;
