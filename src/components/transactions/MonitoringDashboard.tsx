
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, MapPin } from 'lucide-react';
import DashboardMetricsCard from '@/components/dashboard/DashboardMetricsCard';

interface MonitoringDashboardProps {
  metrics: {
    totalTransactions: number;
    flaggedCount: number;
    highRiskUsers: {
      userId: string;
      userName: string;
      totalRisk: number;
      count: number;
      averageRisk: number;
    }[];
    topCorridors: {
      origin: string;
      destination: string;
      count: number;
    }[];
  };
}

const MonitoringDashboard = ({ metrics }: MonitoringDashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricsCard
          title="Total Transactions"
          value={metrics.totalTransactions}
          change="+5%"
          changeType="increase"
          icon={ArrowUpRight}
          changeDirection="positive-up"
        />
        <DashboardMetricsCard
          title="Flagged Transactions"
          value={metrics.flaggedCount}
          change="-2%"
          changeType="decrease"
          icon={ArrowDownRight}
          changeDirection="positive-down"
        />
        <DashboardMetricsCard
          title="Alert Rate"
          value={`${((metrics.flaggedCount / metrics.totalTransactions) * 100).toFixed(1)}%`}
          icon={ArrowDownRight}
          changeDirection="positive-down"
        />
        <DashboardMetricsCard
          title="Avg. Risk Score"
          value="42.8"
          change="+3.2"
          changeType="increase"
          icon={ArrowUpRight}
          changeDirection="positive-down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">High Risk Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.highRiskUsers.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">{user.userName}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.count} transactions
                    </div>
                  </div>
                  <Badge
                    variant={
                      user.averageRisk > 75
                        ? 'destructive'
                        : user.averageRisk > 50
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {Math.round(user.averageRisk)} risk score
                  </Badge>
                </div>
              ))}

              {metrics.highRiskUsers.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No high risk users to display
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Transaction Corridors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topCorridors.slice(0, 5).map((corridor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {corridor.origin} → {corridor.destination}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    {corridor.count} transactions
                  </div>
                </div>
              ))}

              {metrics.topCorridors.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No corridor data to display
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
