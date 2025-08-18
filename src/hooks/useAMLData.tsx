
import { useState, useEffect } from 'react';
import { AMLTransaction } from '@/types/aml';
import { useAMLFilters } from './useAMLFilters';
import { useAMLMetrics } from './useAMLMetrics';
import { useAMLTransactionActions } from './useAMLTransactionActions';
import { usePagination } from './usePagination';
import { UnifiedDataService } from '@/services/unifiedDataService';
import { config } from '@/config/environment';

/**
 * Manages AML transaction data including filtering, pagination, metrics calculation, and user actions.
 * Provides a comprehensive interface for AML monitoring and transaction management.
 */
export const useAMLData = () => {
  // State management
  const [amlTransactionsList, setAMLTransactionsList] = useState<AMLTransaction[]>([]);
  const [currentlySelectedTransaction, setCurrentlySelectedTransaction] = useState<AMLTransaction | null>(null);
  const [detailsModalVisibility, setDetailsModalVisibility] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Load AML data when component mounts or mock mode changes
  useEffect(() => {
    const loadAMLData = async () => {
      setIsDataLoading(true);
      try {
        console.log(`🔄 Loading AML data via ${UnifiedDataService.getCurrentDataSource()}...`);
        
        const amlData = await UnifiedDataService.getAMLTransactions();
        setAMLTransactionsList(amlData);
        
      } catch (error) {
        console.error('Error loading AML data:', error);
        setAMLTransactionsList([]);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadAMLData();
  }, [config.features.useMockData]); // Re-load when mock mode changes
  
  // Use the filtering hook
  const {
    filters: activeFilters,
    searchTerm: currentSearchTerm,
    filteredTransactions: filteredAMLTransactions,
    setFilters: updateFilters,
    setSearchTerm: updateSearchTerm,
  } = useAMLFilters(amlTransactionsList);

  // Use the metrics hook
  const calculatedMetrics = useAMLMetrics(filteredAMLTransactions);

  // Pagination management
  const paginationState = usePagination({ 
    data: filteredAMLTransactions, 
    itemsPerPage: 10 
  });

  // Use the transaction actions hook
  const transactionActionHandlers = useAMLTransactionActions(setAMLTransactionsList);

  /**
   * Opens transaction details modal for the specified transaction
   */
  const handleViewTransactionDetails = (targetTransaction: AMLTransaction) => {
    setCurrentlySelectedTransaction(targetTransaction);
    setDetailsModalVisibility(true);
    console.log('targetTransaction', targetTransaction);
  };

  /**
   * Handles modal open/close state changes
   */
  const handleModalOpenChange = (open: boolean) => {
    console.log('Modal open change called with:', open);
    setDetailsModalVisibility(open);
    if (!open) {
      // Clear selected transaction when modal closes
      setCurrentlySelectedTransaction(null);
      console.log('Modal closed, cleared selected transaction');
    }
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
    loading: isDataLoading,
    
    // Setters
    setIsDetailsModalOpen: setDetailsModalVisibility,
    setFilters: updateFilters,
    setSearchTerm: updateSearchTerm,
    
    // Handlers
    handleViewDetails: handleViewTransactionDetails,
    handleModalOpenChange: handleModalOpenChange,
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

    // Data source info
    dataSource: UnifiedDataService.getCurrentDataSource(),
    isMockMode: config.features.useMockData,
  };
};
