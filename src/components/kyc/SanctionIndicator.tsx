
import React from 'react';
import { AlertTriangle, Shield, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SanctionIndicatorProps {
  isPep: boolean;
  isSanctioned: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SanctionIndicator = ({ isPep, isSanctioned, size = 'md' }: SanctionIndicatorProps) => {
  const sizes = {
    sm: 'text-sm p-2',
    md: 'text-base p-3',
    lg: 'text-lg p-4',
  };
  
  if (isSanctioned) {
    return (
      <div className={cn(
        "flex items-center bg-red-50 text-red-700 rounded-md",
        sizes[size]
      )}>
        <ShieldAlert className="h-5 w-5 mr-2" />
        <div>
          <div className="font-semibold">Sanctioned Individual</div>
          <div className="text-sm">This user appears on a sanctions list. All transactions are blocked.</div>
        </div>
      </div>
    );
  }
  
  if (isPep) {
    return (
      <div className={cn(
        "flex items-center bg-amber-50 text-amber-700 rounded-md",
        sizes[size]
      )}>
        <AlertTriangle className="h-5 w-5 mr-2" />
        <div>
          <div className="font-semibold">Politically Exposed Person</div>
          <div className="text-sm">Enhanced due diligence required for this user.</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "flex items-center bg-green-50 text-green-700 rounded-md",
      sizes[size]
    )}>
      <Shield className="h-5 w-5 mr-2" />
      <div>
        <div className="font-semibold">No Sanctions or PEP Status</div>
        <div className="text-sm">User is not on any watchlists.</div>
      </div>
    </div>
  );
};

export default SanctionIndicator;
