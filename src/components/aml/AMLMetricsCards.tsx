
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, TrendingUp, Users } from 'lucide-react';

interface AMLMetricsCardsProps {
  totalTransactions: number;
  flaggedTransactions: number;
  highRiskTransactions: number;
  totalAmount: number;
}

const AMLMetricsCards: React.FC<AMLMetricsCardsProps> = ({
  totalTransactions,
  flaggedTransactions,
  highRiskTransactions,
  totalAmount,
}) => {
  return (
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
  );
};

export default AMLMetricsCards;
