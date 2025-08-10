
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface RiskBadgeProps {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ 
  riskLevel, 
  showText = true, 
  size = 'md',
  className 
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-1 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const riskText = showText ? riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) : '';

  return (
    <Badge 
      variant="outline" 
      className={cn(
        getRiskColor(riskLevel),
        getSizeClasses(size),
        'font-medium border-0',
        className
      )}
    >
      {riskText}
    </Badge>
  );
};

export default RiskBadge;

// Helper function to convert risk score to risk level
export const getRiskLevelFromScore = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};
