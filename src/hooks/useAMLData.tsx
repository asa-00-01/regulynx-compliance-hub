
import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCompliance } from '@/context/ComplianceContext';
import { mockTransactions } from '@/components/aml/mockTransactionData';
import { AMLTransaction } from '@/types/aml';

export const useAMLData = () => {
  const [searchParams] = useSearchParams();
  const userIdFromParams = searchParams.get('userId');
  
  const [transactions, setTransactions] = useState<AMLTransaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<AMLTransaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '30days',
    riskLevel: 'all',
    status: 'all',
    amountRange: 'all',
    userId: userIdFromParams || '',
    onlyFlagged: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setSelectedUser } = useCompliance();

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // User filter
      if (filters.userId && transaction.senderUserId !== filters.userId) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          transaction.id.toLowerCase().includes(searchLower) ||
          transaction.senderName.toLowerCase().includes(searchLower) ||
          transaction.receiverName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Risk level filter
      if (filters.riskLevel !== 'all') {
        const riskScore = transaction.riskScore;
        switch (filters.riskLevel) {
          case 'low':
            if (riskScore >= 30) return false;
            break;
          case 'medium':
            if (riskScore < 30 || riskScore >= 70) return false;
            break;
          case 'high':
            if (riskScore < 70) return false;
            break;
        }
      }
      
      // Status filter
      if (filters.status !== 'all' && transaction.status !== filters.status) {
        return false;
      }
      
      // Amount range filter
      if (filters.amountRange !== 'all') {
        const amount = transaction.senderAmount;
        switch (filters.amountRange) {
          case 'small':
            if (amount >= 1000) return false;
            break;
          case 'medium':
            if (amount < 1000 || amount >= 10000) return false;
            break;
          case 'large':
            if (amount < 10000) return false;
            break;
        }
      }
      
      return true;
    });
  }, [transactions, filters, searchTerm]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalTransactions = filteredTransactions.length;
    const flaggedTransactions = filteredTransactions.filter(t => t.isSuspect).length;
    const highRiskTransactions = filteredTransactions.filter(t => t.riskScore >= 70).length;
    const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.senderAmount, 0);

    return {
      totalTransactions,
      flaggedTransactions,
      highRiskTransactions,
      totalAmount,
    };
  }, [filteredTransactions]);

  const handleViewDetails = (transaction: AMLTransaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

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

  const handleExportTransactions = () => {
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
    // State
    transactions,
    filteredTransactions,
    selectedTransaction,
    isDetailsModalOpen,
    filters,
    searchTerm,
    metrics,
    
    // Setters
    setIsDetailsModalOpen,
    setFilters,
    setSearchTerm,
    
    // Handlers
    handleViewDetails,
    handleFlagTransaction,
    handleCreateCase,
    handleCreateSAR,
    handleViewUserProfile,
    handleExportTransactions,
  };
};
