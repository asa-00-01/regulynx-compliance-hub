
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
}

const DashboardMetricsCard = ({ title, value, change, changeType, icon: Icon }: MetricCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {changeType === 'increase' ? (
            <span className="flex items-center text-regulynx-red-alert">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              {change} since yesterday
            </span>
          ) : changeType === 'decrease' ? (
            <span className="flex items-center text-regulynx-green-accent">
              <ArrowDownRight className="mr-1 h-3 w-3" />
              {change} since yesterday
            </span>
          ) : (
            <span className="flex items-center text-muted-foreground">
              No change since yesterday
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default DashboardMetricsCard;
