
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  score: number;
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg'; // Add the size prop
}

const RiskBadge = ({ score, showText = true, className, size = 'md' }: RiskBadgeProps) => {
  const getVariant = () => {
    if (score >= 75) return "destructive";
    if (score >= 50) return "warning";
    if (score >= 25) return "secondary";
    return "outline";
  };

  const getText = () => {
    if (score >= 75) return "High Risk";
    if (score >= 50) return "Medium Risk";
    if (score >= 25) return "Low Risk";
    return "Minimal Risk";
  };

  // Apply size classes based on the size prop
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs px-1.5 py-0';
      case 'lg': return 'text-sm px-3 py-0.5';
      default: return ''; // Default size from badge component
    }
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={cn("font-medium", getSizeClasses(), className)}
    >
      {score}{showText && <span className="ml-1">- {getText()}</span>}
    </Badge>
  );
};

export default RiskBadge;
