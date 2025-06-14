
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCompliance } from '@/context/ComplianceContext';
import { AMLTransaction } from '@/types/aml';

export const useAMLTransactionActions = (
  setTransactions: React.Dispatch<React.SetStateAction<AMLTransaction[]>>
) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setSelectedUser } = useCompliance();

  const handleFlagTransaction = (transaction: AMLTransaction) => {
    setTransactions(prevTransactions =>
      prevTransactions.map(t =>
        t.id === transaction.id
          ? { ...t, isSuspect: !t.isSuspect, status: !t.isSuspect ? 'flagged' : 'completed' }
          : t
      )
    );

    toast({
      title: transaction.isSuspect ? "Transaction Unflagged" : "Transaction Flagged",
      description: `Transaction ${transaction.id.substring(0, 8)}... has been ${transaction.isSuspect ? 'unflagged' : 'flagged as suspicious'}`,
      variant: transaction.isSuspect ? "default" : "destructive",
    });
  };

  const handleCreateCase = (transaction: AMLTransaction) => {
    navigate('/compliance-cases', {
      state: {
        createCase: true,
        userData: {
          userId: transaction.senderUserId,
          userName: transaction.senderName,
          description: `AML Alert: ${transaction.id} - Amount: ${transaction.senderAmount} ${transaction.senderCurrency}`,
          type: 'aml',
          source: 'aml_monitoring',
          riskScore: transaction.riskScore,
          transactionData: transaction
        }
      }
    });

    toast({
      title: "AML Case Created",
      description: `Investigation case created for transaction ${transaction.id.substring(0, 8)}...`,
    });
  };

  const handleCreateSAR = (transaction: AMLTransaction) => {
    navigate('/sar-center', {
      state: {
        createSAR: true,
        transactionData: transaction
      }
    });

    toast({
      title: "SAR Creation",
      description: "Navigating to create Suspicious Activity Report",
    });
  };

  const handleViewUserProfile = (userId: string) => {
    setSelectedUser(userId);
    navigate(`/user-case/${userId}`, {
      state: {
        returnTo: '/aml-monitoring'
      }
    });
  };

  const handleExportTransactions = (filteredTransactions: AMLTransaction[]) => {
    const csvContent = [
      ['ID', 'Date', 'Sender', 'Amount', 'Currency', 'Destination', 'Status', 'Risk Score', 'Flagged'].join(','),
      ...filteredTransactions.map(tx => [
        tx.id,
        new Date(tx.timestamp).toLocaleDateString(),
        tx.senderName,
        tx.senderAmount,
        tx.senderCurrency,
        tx.receiverCountryCode,
        tx.status,
        tx.riskScore,
        tx.isSuspect ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aml-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${filteredTransactions.length} transactions exported to CSV`,
    });
  };

  return {
    handleFlagTransaction,
    handleCreateCase,
    handleCreateSAR,
    handleViewUserProfile,
    handleExportTransactions,
  };
};
