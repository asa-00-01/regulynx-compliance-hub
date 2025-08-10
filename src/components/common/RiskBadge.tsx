
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface RiskBadgeProps {
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  score?: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ 
  riskLevel, 
  score,
  showText = true, 
  size = 'md',
  className 
}) => {
  // Convert score to riskLevel if score is provided
  const computedRiskLevel = riskLevel || (score !== undefined ? getRiskLevelFromScore(score) : 'low');

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

  const displayText = showText 
    ? `${score !== undefined ? score : ''} ${score !== undefined ? '- ' : ''}${computedRiskLevel.charAt(0).toUpperCase() + computedRiskLevel.slice(1)}${score !== undefined ? ' Risk' : ''}`
    : (score !== undefined ? score.toString() : '');

  return (
    <Badge 
      variant="outline" 
      className={cn(
        getRiskColor(computedRiskLevel),
        getSizeClasses(size),
        'font-medium border-0',
        className
      )}
    >
      {displayText}
    </Badge>
  );
};

export default RiskBadge;

// Helper function to convert risk score to risk level
export const getRiskLevelFromScore = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
};
