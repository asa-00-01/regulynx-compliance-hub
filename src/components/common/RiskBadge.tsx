
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface RiskBadgeProps {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ riskLevel, className }) => {
  const getVariant = (level: string) => {
    switch (level) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getColorClass = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge 
      variant={getVariant(riskLevel)} 
      className={cn(getColorClass(riskLevel), className)}
    >
      {riskLevel.toUpperCase()}
    </Badge>
  );
};

export default RiskBadge;
