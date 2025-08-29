import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Flag, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { TransactionStats } from '@/services/transactionService';
import { useTranslation } from 'react-i18next';

interface TransactionStatsCardsProps {
  stats: TransactionStats;
  loading?: boolean;
}

const TransactionStatsCards: React.FC<TransactionStatsCardsProps> = ({ stats, loading = false }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('transactions.total')}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 mr-1 inline-block" />
            Total transactions
          </p>
        </CardContent>
      </Card>

      {/* Flagged Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('transactions.flagged')}</CardTitle>
          <Flag className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.flaggedTransactions.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">
            Requiring review
          </p>
        </CardContent>
      </Card>

      {/* Total Volume */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('transactions.volume')}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalVolume.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">
            Total transaction volume
          </p>
        </CardContent>
      </Card>

      {/* Unique Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('transactions.users')}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.uniqueUsers.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">
            Unique users
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionStatsCards;
