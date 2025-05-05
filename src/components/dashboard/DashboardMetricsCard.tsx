
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  changeDirection?: 'positive-up' | 'positive-down' | 'standard';
  valueColor?: string;
}

const DashboardMetricsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  changeDirection = 'standard',
  valueColor
}: MetricCardProps) => {
  // Determine the appropriate color class based on change type and direction
  const getChangeColorClass = () => {
    if (changeType === 'neutral') return "text-muted-foreground";
    
    if (changeDirection === 'positive-down') {
      // For metrics where decrease is good (e.g., risk scores)
      return changeType === 'decrease' ? "text-green-600" : "text-red-600";
    } else if (changeDirection === 'positive-up') {
      // For metrics where increase is good (e.g., compliance rate)
      return changeType === 'increase' ? "text-green-600" : "text-red-600";
    } else {
      // Standard behavior (increase is red, decrease is green)
      return changeType === 'increase' ? "text-red-600" : "text-green-600";
    }
  };

  const changeColorClass = getChangeColorClass();
  const valueColorClass = valueColor || '';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColorClass}`}>{value}</div>
        {change && (
          <p className="text-xs">
            {changeType === 'increase' ? (
              <span className={`flex items-center ${changeColorClass}`}>
                <ArrowUpRight className="mr-1 h-3 w-3" />
                {change} since yesterday
              </span>
            ) : changeType === 'decrease' ? (
              <span className={`flex items-center ${changeColorClass}`}>
                <ArrowDownRight className="mr-1 h-3 w-3" />
                {change} since yesterday
              </span>
            ) : (
              <span className="flex items-center text-muted-foreground">
                <Minus className="mr-1 h-3 w-3" />
                No change since yesterday
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardMetricsCard;
