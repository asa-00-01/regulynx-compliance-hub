
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag, FilePenLine, AlertTriangle, Shield } from 'lucide-react';

interface DashboardStatsProps {
  flaggedUsers: number;
  pendingReviews: number;
  highRiskUsers: number;
  recentAlerts: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ flaggedUsers, pendingReviews, highRiskUsers, recentAlerts }) => {
  const stats = [
    { title: 'Flagged Users', value: flaggedUsers, icon: Flag, description: 'Require immediate attention' },
    { title: 'Pending Reviews', value: pendingReviews, icon: FilePenLine, description: 'Awaiting verification' },
    { title: 'High Risk Users', value: highRiskUsers, icon: AlertTriangle, description: 'Above 70 risk score' },
    { title: 'Recent Alerts', value: recentAlerts, icon: Shield, description: 'Last 7 days' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map(stat => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
