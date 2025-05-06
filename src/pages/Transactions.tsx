
import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useTransactionData } from '@/hooks/useTransactionData';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import TransactionDetails from '@/components/transactions/TransactionDetails';
import AlertsTable from '@/components/transactions/AlertsTable';
import AlertDetails from '@/components/transactions/AlertDetails';
import MonitoringDashboard from '@/components/transactions/MonitoringDashboard';
import { usePermissions } from '@/hooks/use-permissions';
import { Transaction, TransactionAlert } from '@/types/transaction';
import { mockTransactionData } from '@/components/transactions/mockTransactionData';

const TransactionsPage = () => {
  const {
    filteredTransactions,
    alerts,
    filters,
    setFilters,
    metrics,
    updateAlertStatus,
    addAlertNote,
    createCaseFromAlert,
    dismissAlert,
  } = useTransactionData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<TransactionAlert | null>(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  
  const { hasPermission, canManageCases } = usePermissions();
  const canViewTransactionDetails = hasPermission('document:view');
  const canManageAlerts = hasPermission('document:approve');

  // Get unique list of countries from transactions
  const countries = useMemo(() => {
    const countrySet = new Set<string>();
    mockTransactionData.transactions.forEach(tx => {
      countrySet.add(tx.originCountry);
      countrySet.add(tx.destinationCountry);
    });
    return Array.from(countrySet).sort();
  }, []);

  // Handle view transaction
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  // Handle view alert
  const handleViewAlert = (alert: TransactionAlert) => {
    setSelectedAlert(alert);
    
    // Find related transaction
    const transaction = mockTransactionData.transactions.find(
      tx => tx.id === alert.transactionId
    ) || null;
    
    setSelectedTransaction(transaction);
    setShowAlertDetails(true);
  };

  // Handle creating a manual alert
  const handleCreateAlert = (transaction: Transaction) => {
    // In a real implementation, this would create an alert in the database
    // For now, we'll just show the details
    handleViewTransaction(transaction);
  };

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Transaction Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor and analyze transactions for compliance and fraud prevention
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3 md:w-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <MonitoringDashboard metrics={metrics} />
          </TabsContent>
          
          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <TransactionFilters 
              filters={filters} 
              onFilterChange={setFilters} 
              countries={countries}
            />
            
            <Card>
              <CardContent className="pt-6">
                <TransactionTable 
                  transactions={filteredTransactions}
                  onViewTransaction={canViewTransactionDetails ? handleViewTransaction : undefined}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <AlertsTable 
                  alerts={alerts.filter(alert => filters.dateRange === 'all' || new Date(alert.timestamp) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))}
                  onViewAlert={handleViewAlert}
                  onCreateCase={createCaseFromAlert}
                  onDismiss={dismissAlert}
                  canManageAlerts={canManageAlerts}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Transaction Details Modal */}
        <TransactionDetails
          transaction={selectedTransaction}
          open={showTransactionDetails}
          onOpenChange={setShowTransactionDetails}
          onCreateAlert={canManageAlerts ? handleCreateAlert : undefined}
        />

        {/* Alert Details Modal */}
        <AlertDetails
          alert={selectedAlert}
          transaction={selectedTransaction}
          open={showAlertDetails}
          onOpenChange={setShowAlertDetails}
          onAddNote={canManageAlerts ? addAlertNote : undefined}
          onCreateCase={canManageAlerts ? createCaseFromAlert : undefined}
          onDismiss={canManageAlerts ? dismissAlert : undefined}
          canManageAlerts={canManageAlerts}
        />
      </div>
    </DashboardLayout>
  );
};

export default TransactionsPage;
