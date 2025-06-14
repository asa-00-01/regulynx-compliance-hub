
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionDetailsModal from '@/components/aml/TransactionDetailsModal';
import PatternDetectionEngine from '@/components/aml/PatternDetectionEngine';
import AMLMetricsCards from '@/components/aml/AMLMetricsCards';
import AMLFiltersSection from '@/components/aml/AMLFiltersSection';
import AMLTransactionTableSection from '@/components/aml/AMLTransactionTableSection';
import { useAMLData } from '@/hooks/useAMLData';

const AMLMonitoring = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    filteredTransactions,
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
  } = useAMLData();

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AML Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor transactions for anti-money laundering compliance
          </p>
        </div>

        {/* Metrics Cards */}
        <AMLMetricsCards
          totalTransactions={metrics.totalTransactions}
          flaggedTransactions={metrics.flaggedTransactions}
          highRiskTransactions={metrics.highRiskTransactions}
          totalAmount={metrics.totalAmount}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Transaction Overview</TabsTrigger>
            <TabsTrigger value="patterns">Pattern Detection</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Filters and Search */}
            <AMLFiltersSection
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              onFilterChange={setFilters}
              filteredTransactionsCount={filteredTransactions.length}
              onExport={handleExportTransactions}
            />

            {/* Transactions Table */}
            <AMLTransactionTableSection
              filteredTransactions={filteredTransactions}
              onViewDetails={handleViewDetails}
              onFlagTransaction={handleFlagTransaction}
              onCreateCase={handleCreateCase}
              showUserColumn={!filters.userId}
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
