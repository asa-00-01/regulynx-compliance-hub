
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionDetailsModal from '@/components/aml/TransactionDetailsModal';
import PatternDetectionEngine from '@/components/aml/PatternDetectionEngine';
import AMLMetricsCards from '@/components/aml/AMLMetricsCards';
import AMLFiltersSection from '@/components/aml/AMLFiltersSection';
import AMLTransactionTableSection from '@/components/aml/AMLTransactionTableSection';
import { useAMLData } from '@/hooks/useAMLData';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AMLMonitoring = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const location = useLocation();
  const { t } = useTranslation();
  
  const {
    filteredTransactions,
    paginatedTransactions,
    selectedTransaction,
    isDetailsModalOpen,
    filters,
    searchTerm,
    metrics,
    setIsDetailsModalOpen,
    setFilters,
    setSearchTerm,
    handleViewDetails,
    handleFlagTransaction,
    handleCreateCase,
    handleExportTransactions,
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
  } = useAMLData();

  useEffect(() => {
    if (location.state?.transactionId && filteredTransactions.length > 0) {
      const transactionToView = filteredTransactions.find(t => t.id === location.state.transactionId);
      if (transactionToView) {
        handleViewDetails(transactionToView);
        // Clear the location state to prevent modal reopening on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, filteredTransactions, handleViewDetails]);

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="space-y-6 w-full">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('navigation.amlMonitoring')}</h1>
          <p className="text-muted-foreground">
            {t('amlMonitoring.description')}
          </p>
        </div>

        {/* Metrics Cards */}
        <AMLMetricsCards
          totalTransactions={metrics.totalTransactions}
          flaggedTransactions={metrics.flaggedTransactions}
          highRiskTransactions={metrics.highRiskTransactions}
          totalAmount={metrics.totalAmount}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 w-full">
          <TabsList>
            <TabsTrigger value="overview">{t('amlMonitoring.tabOverview')}</TabsTrigger>
            <TabsTrigger value="patterns">{t('aml.patternDetection')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('amlMonitoring.searchPlaceholder')}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters and Export */}
            <AMLFiltersSection
              filters={filters}
              onFilterChange={setFilters}
              filteredTransactionsCount={filteredTransactions.length}
              onExport={handleExportTransactions}
            />

            {/* Transactions Table */}
            <AMLTransactionTableSection
              transactions={paginatedTransactions}
              onViewTransaction={handleViewDetails}
              onFlagTransaction={handleFlagTransaction}
              onCreateCase={handleCreateCase}
            />
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <PatternDetectionEngine />
          </TabsContent>
        </Tabs>

        {/* Transaction Details Modal */}
        <TransactionDetailsModal
          transaction={selectedTransaction}
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
          onFlag={handleFlagTransaction}
          onCreateCase={handleCreateCase}
        />
      </div>
    </DashboardLayout>
  );
};

export default AMLMonitoring;
