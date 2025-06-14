import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, TrendingUp, Users, Search, Filter, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCompliance } from '@/context/ComplianceContext';
import TransactionsOverviewTable from '@/components/aml/TransactionsOverviewTable';
import TransactionDetailsModal from '@/components/aml/TransactionDetailsModal';
import TransactionFilters from '@/components/aml/TransactionFilters';
import PatternDetectionEngine from '@/components/aml/PatternDetectionEngine';
import { mockTransactions } from '@/components/aml/mockTransactionData';
import { AMLTransaction } from '@/types/aml';

const AMLMonitoring = () => {
  const [searchParams] = useSearchParams();
  const userIdFromParams = searchParams.get('userId');
  
  const [transactions, setTransactions] = useState<AMLTransaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<AMLTransaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
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
  const totalTransactions = filteredTransactions.length;
  const flaggedTransactions = filteredTransactions.filter(t => t.isSuspect).length;
  const highRiskTransactions = filteredTransactions.filter(t => t.riskScore >= 70).length;
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.senderAmount, 0);

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                In current filter
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Flagged Transactions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flaggedTransactions}</div>
              <p className="text-xs text-muted-foreground">
                Require review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highRiskTransactions}</div>
              <p className="text-xs text-muted-foreground">
                Risk score ≥ 70
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                In filtered transactions
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Transaction Overview</TabsTrigger>
            <TabsTrigger value="patterns">Pattern Detection</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Filters and Search */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <TransactionFilters
                filters={filters}
                onFilterChange={setFilters}
              />

              <Button variant="outline" className="ml-auto" onClick={handleExportTransactions}>
                <Download className="mr-2 h-4 w-4" />
                Export ({filteredTransactions.length})
              </Button>
            </div>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>AML Transaction Monitoring</CardTitle>
                <CardDescription>
                  Review transactions for suspicious activity and compliance violations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionsOverviewTable
                  transactions={filteredTransactions}
                  onViewDetails={handleViewDetails}
                  onFlagTransaction={handleFlagTransaction}
                  onCreateCase={handleCreateCase}
                  showUserColumn={!filters.userId}
                />
              </CardContent>
            </Card>
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
