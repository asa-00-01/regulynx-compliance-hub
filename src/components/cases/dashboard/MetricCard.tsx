
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon }) => (
  <Card className="h-full">
    <CardContent className="p-6">
      <div className="flex items-start justify-between space-x-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
        <div className="flex-shrink-0">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

export default MetricCard;
