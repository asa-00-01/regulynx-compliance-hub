
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BadgeVariant } from '@/components/ui/badge-variants';

interface RiskBadgeProps {
  score: number;
  showText?: boolean;
  className?: string;
}

const RiskBadge = ({ score, showText = true, className }: RiskBadgeProps) => {
  const getVariant = (): BadgeVariant => {
    if (score >= 75) return "destructive";
    if (score >= 50) return "secondary";
    if (score >= 25) return "secondary";
    return "outline";
  };

  const getText = () => {
    if (score >= 75) return "High Risk";
    if (score >= 50) return "Medium Risk";
    if (score >= 25) return "Low Risk";
    return "Minimal Risk";
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={cn("font-medium", className)}
    >
      {score}{showText && <span className="ml-1">- {getText()}</span>}
    </Badge>
  );
};

export default RiskBadge;
