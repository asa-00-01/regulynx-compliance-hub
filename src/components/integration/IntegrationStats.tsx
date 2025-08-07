
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Database, AlertTriangle } from 'lucide-react';
import { IntegrationStats as StatsType } from '@/types/integration';

interface IntegrationStatsProps {
  stats: StatsType;
}

const IntegrationStats = ({ stats }: IntegrationStatsProps) => {
  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      description: 'Connected integrations',
      color: 'text-blue-600',
    },
    {
      title: 'Active Integrations',
      value: stats.activeIntegrations,
      icon: Activity,
      description: 'Currently running',
      color: 'text-green-600',
    },
    {
      title: 'Data Ingested',
      value: stats.totalDataIngested.toLocaleString(),
      icon: Database,
      description: 'Total records processed',
      color: 'text-purple-600',
    },
    {
      title: 'Error Rate',
      value: `${stats.errorRate}%`,
      icon: AlertTriangle,
      description: 'Data processing errors',
      color: stats.errorRate > 5 ? 'text-red-600' : 'text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              {stat.title === 'Error Rate' && stats.avgProcessingTime > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Avg processing: {stats.avgProcessingTime.toFixed(0)}ms
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default IntegrationStats;
