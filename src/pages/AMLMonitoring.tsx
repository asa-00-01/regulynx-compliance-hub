
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import TransactionsOverviewTable from '@/components/aml/TransactionsOverviewTable';
import TransactionFilters from '@/components/aml/TransactionFilters';
import { mockTransactions } from '@/components/aml/mockTransactionData';
import { AMLTransaction } from '@/types/aml';
import TransactionDetailsModal from '@/components/aml/TransactionDetailsModal';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useCompliance } from '@/context/ComplianceContext';
import UserCard from '@/components/user/UserCard';

const AMLMonitoringPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  
  const { getUserById } = useCompliance();
  const [activeTab, setActiveTab] = useState('transactions');
  const [selectedTransaction, setSelectedTransaction] = useState<AMLTransaction | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '30days',
    minAmount: undefined as number | undefined,
    maxAmount: undefined as number | undefined,
    country: undefined as string | undefined,
    riskLevel: 'all' as string,
    onlyFlagged: false,
    userId: userId || undefined as string | undefined
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Update filters when URL changes
  useEffect(() => {
    if (userId) {
      setFilters(prevFilters => ({
        ...prevFilters,
        userId
      }));
    }
  }, [userId]);

  const handleViewTransactionDetails = (transaction: AMLTransaction) => {
    setSelectedTransaction(transaction);
    setDetailsModalOpen(true);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleFlagTransaction = (transaction: AMLTransaction) => {
    toast({
      title: 'Transaction Flagged',
      description: `Transaction ${transaction.id.substring(0, 8)}... has been flagged for review.`,
    });
    // In a real application, we would update the transaction status in the database
    setDetailsModalOpen(false);
  };

  const handleCreateCase = (transaction: AMLTransaction) => {
    // Navigate to compliance cases page with initial case data
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
    
    setDetailsModalOpen(false);
  };

  // Apply filters to transactions
  const filteredTransactions = mockTransactions.filter(transaction => {
    // User filter
    if (filters.userId && transaction.senderUserId !== filters.userId) {
      return false;
    }
    
    // Date range filter would be applied here in a real app
    
    // Min amount filter
    if (filters.minAmount && transaction.senderAmount < filters.minAmount) {
      return false;
    }
    
    // Max amount filter
    if (filters.maxAmount && transaction.senderAmount > filters.maxAmount) {
      return false;
    }
    
    // Country filter
    if (filters.country && 
        transaction.senderCountryCode !== filters.country && 
        transaction.receiverCountryCode !== filters.country) {
      return false;
    }
    
    // Risk level filter
    if (filters.riskLevel !== 'all') {
      if (filters.riskLevel === 'high' && transaction.riskScore < 75) {
        return false;
      }
      if (filters.riskLevel === 'medium' && (transaction.riskScore < 50 || transaction.riskScore >= 75)) {
        return false;
      }
      if (filters.riskLevel === 'low' && transaction.riskScore >= 50) {
        return false;
      }
    }
    
    // Flagged filter
    if (filters.onlyFlagged && !transaction.isSuspect) {
      return false;
    }
    
    return true;
  });

  const userDetails = filters.userId ? getUserById(filters.userId) : null;

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AML Transaction Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor transactions for suspicious patterns and AML compliance
            {userDetails && ` - Viewing transactions for ${userDetails.fullName}`}
          </p>
        </div>

        {/* Show user card if filtering by user */}
        {filters.userId && (
          <div className="mb-4 max-w-md">
            <UserCard userId={filters.userId} />
          </div>
        )}

        <Tabs defaultValue="transactions" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions">
            <div className="space-y-4">
              <TransactionFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
                allowUserFilter={!filters.userId}
              />
              
              <Card>
                <CardContent className="pt-6">
                  <TransactionsOverviewTable 
                    transactions={filteredTransactions}
                    onViewDetails={handleViewTransactionDetails}
                    onFlagTransaction={handleFlagTransaction}
                    onCreateCase={handleCreateCase}
                    showUserColumn={!filters.userId}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="patterns">
            <Card>
              <CardContent className="pt-6 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Pattern Analysis</h3>
                  <p className="text-muted-foreground">This feature is coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card>
              <CardContent className="pt-6 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">AML Reports</h3>
                  <p className="text-muted-foreground">This feature is coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        onFlag={handleFlagTransaction}
        onCreateCase={handleCreateCase}
      />
    </DashboardLayout>
  );
};

export default AMLMonitoringPage;
