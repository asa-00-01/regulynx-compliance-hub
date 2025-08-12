
import React, { useState, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mock transaction data
  const transactions = [
    {
      id: 'TXN-001',
      userId: 'user-123',
      userName: 'John Doe',
      amount: 15000,
      currency: 'USD',
      type: 'deposit',
      status: 'completed',
      date: '2023-12-15T10:30:00Z',
      description: 'Wire transfer deposit',
      riskScore: 85,
      flagged: true
    },
    {
      id: 'TXN-002',
      userId: 'user-456',
      userName: 'Jane Smith',
      amount: 2500,
      currency: 'USD',
      type: 'withdrawal',
      status: 'pending',
      date: '2023-12-15T09:15:00Z',
      description: 'ACH withdrawal',
      riskScore: 25,
      flagged: false
    },
    {
      id: 'TXN-003',
      userId: 'user-789',
      userName: 'Robert Johnson',
      amount: 50000,
      currency: 'USD',
      type: 'deposit',
      status: 'under_review',
      date: '2023-12-14T16:45:00Z',
      description: 'Large cash deposit',
      riskScore: 95,
      flagged: true
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const searchMatch = transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || transaction.status === statusFilter;
    const amountMatch = amountFilter === 'all' || 
                       (amountFilter === 'high' && transaction.amount >= 10000) ||
                       (amountFilter === 'medium' && transaction.amount >= 1000 && transaction.amount < 10000) ||
                       (amountFilter === 'low' && transaction.amount < 1000);
    
    return searchMatch && statusMatch && amountMatch;
  });

  const handleViewTransaction = (transaction: any) => {
    navigate('/aml-monitoring', { state: { transactionId: transaction.id } });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'under_review': return 'destructive';
      default: return 'outline';
    }
  };

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
                  <div className="capitalize">{transaction.type}</div>
                  <div>
                    <Badge variant={getStatusBadgeVariant(transaction.status)}>
                      {transaction.status.replace('_', ' ')}
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
