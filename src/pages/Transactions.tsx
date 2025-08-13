
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download,
  ArrowUpDown,
  Eye,
  Flag,
  DollarSign,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { config } from '@/config/environment';
import type { Transaction } from '@/types/transaction';
import { mockTransactionData } from '@/components/transactions/mockTransactionData';
import { useTranslation } from 'react-i18next';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Source transactions based on mock flag
  const transactions: Transaction[] = useMemo(() => {
    if (config.features.useMockData) {
      return (mockTransactionData?.transactions ?? []) as Transaction[];
    }
    return [] as Transaction[];
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const searchMatch = transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'under_review' && transaction.flagged) ||
      (statusFilter === 'completed' && !transaction.flagged) ||
      (statusFilter !== 'under_review' && statusFilter !== 'completed');
    const amountMatch = amountFilter === 'all' || 
                       (amountFilter === 'high' && transaction.amount >= 10000) ||
                       (amountFilter === 'medium' && transaction.amount >= 1000 && transaction.amount < 10000) ||
                       (amountFilter === 'low' && transaction.amount < 1000);
    
    return searchMatch && statusMatch && amountMatch;
  });

  const handleViewTransaction = (transaction: Transaction) => {
    navigate('/aml-monitoring', { state: { transactionId: transaction.id } });
  };

  const getStatusBadgeVariant = (isFlagged: boolean) => (isFlagged ? 'destructive' : 'default');

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 80) return 'destructive';
    if (score >= 50) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('navigation.transactions')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('transactions.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t('common.export')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('transactions.total')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1 inline-block" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('transactions.flagged')}</CardTitle>
            <Flag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {transactions.filter(t => t.flagged).length}
            </div>
            <p className="text-sm text-muted-foreground">
              Requiring review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('transactions.volume')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              Total transaction volume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('transactions.users')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(transactions.map(t => t.userId)).size}
            </div>
            <p className="text-sm text-muted-foreground">
              Unique users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('transactions.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('transactions.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('transactions.allStatuses')}</SelectItem>
              <SelectItem value="completed">{t('transactions.completed')}</SelectItem>
              <SelectItem value="pending">{t('transactions.pending')}</SelectItem>
              <SelectItem value="under_review">{t('transactions.underReview')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={amountFilter} onValueChange={setAmountFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('transactions.amount')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('transactions.allAmounts')}</SelectItem>
              <SelectItem value="high">{t('transactions.highAmount')}</SelectItem>
              <SelectItem value="medium">{t('transactions.mediumAmount')}</SelectItem>
              <SelectItem value="low">{t('transactions.lowAmount')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {t('common.filters')}
        </Button>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('transactions.recentTransactions')}</CardTitle>
          <CardDescription>
            {t('transactions.recentTransactionsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-7 p-4 bg-muted/50 text-sm font-medium">
              <div className="flex items-center gap-2">
                {t('transactions.id')}
                <ArrowUpDown className="h-4 w-4" />
              </div>
              <div>{t('transactions.user')}</div>
              <div>{t('transactions.amount')}</div>
              <div>{t('transactions.type')}</div>
              <div>{t('transactions.status')}</div>
              <div>{t('transactions.riskScore')}</div>
              <div>{t('common.actions')}</div>
            </div>
            <div className="divide-y">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="grid grid-cols-7 p-4 items-center hover:bg-muted/30">
                  <div className="font-medium">{transaction.id}</div>
                  <div>{transaction.userName}</div>
                  <div className="font-medium">
                    ${transaction.amount.toLocaleString()} {transaction.currency}
                  </div>
                  <div className="capitalize">{transaction.method}</div>
                  <div>
                    <Badge variant={getStatusBadgeVariant(transaction.flagged)}>
                      {transaction.flagged ? t('transactions.flagged') : t('transactions.completed')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskBadgeVariant(transaction.riskScore)}>
                      {transaction.riskScore}
                    </Badge>
                    {transaction.flagged && <Flag className="h-4 w-4 text-red-500" />}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewTransaction(transaction)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
