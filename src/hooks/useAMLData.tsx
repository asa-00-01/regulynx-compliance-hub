
import { useState } from 'react';
import { mockTransactions } from '@/components/aml/mockTransactionData';
import { AMLTransaction } from '@/types/aml';
import { useAMLFilters } from './useAMLFilters';
import { useAMLMetrics } from './useAMLMetrics';
import { useAMLTransactionActions } from './useAMLTransactionActions';
import { usePagination } from './usePagination';

/**
 * Manages AML transaction data including filtering, pagination, metrics calculation, and user actions.
 * Provides a comprehensive interface for AML monitoring and transaction management.
 */
export const useAMLData = () => {
  // State management
  const [amlTransactionsList, setAMLTransactionsList] = useState<AMLTransaction[]>(mockTransactions);
  const [currentlySelectedTransaction, setCurrentlySelectedTransaction] = useState<AMLTransaction | null>(null);
  const [detailsModalVisibility, setDetailsModalVisibility] = useState(false);
  
  // Use the new filtering hook
  const {
    filters: activeFilters,
    searchTerm: currentSearchTerm,
    filteredTransactions: filteredAMLTransactions,
    setFilters: updateFilters,
    setSearchTerm: updateSearchTerm,
  } = useAMLFilters(amlTransactionsList);

  // Use the new metrics hook
  const calculatedMetrics = useAMLMetrics(filteredAMLTransactions);

  // Pagination management
  const paginationState = usePagination({ 
    data: filteredAMLTransactions, 
    itemsPerPage: 10 
  });

  // Use the new transaction actions hook
  const transactionActionHandlers = useAMLTransactionActions(setAMLTransactionsList);

  /**
   * Opens transaction details modal for the specified transaction
   */
  const handleViewTransactionDetails = (targetTransaction: AMLTransaction) => {
    setCurrentlySelectedTransaction(targetTransaction);
    setDetailsModalVisibility(true);
  };

  /**
   * Wraps export handler to pass filtered transactions
   */
  const handleExportFilteredTransactions = () => {
    transactionActionHandlers.handleExportTransactions(filteredAMLTransactions);
  };

  return {
    // State
    transactions: amlTransactionsList,
    filteredTransactions: filteredAMLTransactions,
    paginatedTransactions: paginationState.currentData,
    selectedTransaction: currentlySelectedTransaction,
    isDetailsModalOpen: detailsModalVisibility,
    filters: activeFilters,
    searchTerm: currentSearchTerm,
    metrics: calculatedMetrics,
    
    // Setters
    setIsDetailsModalOpen: setDetailsModalVisibility,
    setFilters: updateFilters,
    setSearchTerm: updateSearchTerm,
    
    // Handlers
    handleViewDetails: handleViewTransactionDetails,
    handleFlagTransaction: transactionActionHandlers.handleFlagTransaction,
    handleCreateCase: transactionActionHandlers.handleCreateCase,
    handleCreateSAR: transactionActionHandlers.handleCreateSAR,
    handleViewUserProfile: transactionActionHandlers.handleViewUserProfile,
    handleExportTransactions: handleExportFilteredTransactions,

    // Pagination
    currentPage: paginationState.currentPage,
    totalPages: paginationState.totalPages,
    goToPage: paginationState.goToPage,
    goToNextPage: paginationState.goToNextPage,
    goToPrevPage: paginationState.goToPrevPage,
    hasNextPage: paginationState.hasNextPage,
    hasPrevPage: paginationState.hasPrevPage,
    startIndex: paginationState.startIndex,
    endIndex: paginationState.endIndex,
    totalItems: paginationState.totalItems,
  };
};
