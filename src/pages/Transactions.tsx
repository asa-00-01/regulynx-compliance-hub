
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionStatsCards from '@/components/transactions/TransactionStatsCards';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import TransactionTable from '@/components/transactions/TransactionTable';
import { useToast } from '@/hooks/use-toast';

const Transactions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  const {
    // Data
    paginatedTransactions,
    stats,
    loading,
    error,

    // Filters
    filters,
    updateFilters,

    // Pagination
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    goToPage,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,

    // Actions
    updateTransactionStatus,
    exportTransactions,
    refresh,
    isMockMode
  } = useTransactions();

  const handleViewTransaction = (transaction: any) => {
    navigate('/aml-monitoring', { state: { transactionId: transaction.id } });
  };

  const handleUpdateStatus = async (transactionId: string, status: 'completed' | 'pending' | 'flagged' | 'failed') => {
    const success = await updateTransactionStatus(transactionId, status);
    
    if (success) {
      toast({
        title: 'Status Updated',
        description: `Transaction status updated to ${status}`,
        variant: status === 'flagged' ? 'destructive' : 'default',
      });
    } else {
      toast({
        title: 'Update Failed',
        description: 'Failed to update transaction status',
        variant: 'destructive',
      });
    }
    
    return success;
  };

  const handleExport = async () => {
    try {
      await exportTransactions();
      toast({
        title: 'Export Successful',
        description: 'Transaction data has been exported to CSV',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export transaction data',
        variant: 'destructive',
      });
    }
  };

  const handleClearFilters = () => {
    updateFilters({
      status: 'all',
      riskLevel: undefined,
      searchTerm: '',
      amountRange: undefined,
      dateRange: undefined
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('navigation.transactions')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('transactions.description')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Transactions</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={refresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('navigation.transactions')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('transactions.description')}
          </p>
          {isMockMode && (
            <p className="text-sm text-yellow-600 mt-1">
              ⚠️ Using mock data - switch to real data in configuration
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <TransactionStatsCards stats={stats} loading={loading} />

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        onFilterChange={updateFilters}
        onClearFilters={handleClearFilters}
        totalCount={totalItems}
        filteredCount={paginatedTransactions.length}
      />

      {/* Transactions Table */}
      <TransactionTable
        transactions={paginatedTransactions}
        loading={loading}
        onViewTransaction={handleViewTransaction}
        onUpdateStatus={handleUpdateStatus}
        onExport={handleExport}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={goToPage}
        onNextPage={goToNextPage}
        onPrevPage={goToPrevPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  );
};

export default Transactions;
