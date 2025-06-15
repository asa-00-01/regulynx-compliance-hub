
import { useState } from 'react';
import { mockTransactions } from '@/components/aml/mockTransactionData';
import { AMLTransaction } from '@/types/aml';
import { useAMLFilters } from './useAMLFilters';
import { useAMLMetrics } from './useAMLMetrics';
import { useAMLTransactionActions } from './useAMLTransactionActions';
import { usePagination } from './usePagination';

export const useAMLData = () => {
  const [transactions, setTransactions] = useState<AMLTransaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<AMLTransaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Use the new filtering hook
  const {
    filters,
    searchTerm,
    filteredTransactions,
    setFilters,
    setSearchTerm,
  } = useAMLFilters(transactions);

  // Use the new metrics hook
  const metrics = useAMLMetrics(filteredTransactions);

  // Pagination
  const {
    currentData: paginatedTransactions,
    currentPage,
    totalPages,
    goToPage,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({ data: filteredTransactions, itemsPerPage: 10 });

  // Use the new transaction actions hook
  const {
    handleFlagTransaction,
    handleCreateCase,
    handleCreateSAR,
    handleViewUserProfile,
    handleExportTransactions,
  } = useAMLTransactionActions(setTransactions);

  const handleViewDetails = (transaction: AMLTransaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  // Wrap export handler to pass filtered transactions
  const wrappedExportHandler = () => {
    handleExportTransactions(filteredTransactions);
  };

  return {
    // State
    transactions,
    filteredTransactions,
    paginatedTransactions,
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
    handleExportTransactions: wrappedExportHandler,

    // Pagination
    currentPage,
    totalPages,
    goToPage,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    totalItems,
  };
};
