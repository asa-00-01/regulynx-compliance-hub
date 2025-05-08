
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserFlags } from '@/types/kyc';
import { Shield, AlertTriangle, Check, X } from 'lucide-react';
import { TooltipHelp } from '@/components/ui/tooltip-custom';

interface UserFlagsDisplayProps {
  flags: UserFlags;
  showLabels?: boolean;
}

const UserFlagsDisplay: React.FC<UserFlagsDisplayProps> = ({ flags, showLabels = false }) => {
  return (
    <div className="flex gap-1 flex-wrap">
      {flags.is_verified_pep && (
        <TooltipHelp content="Politically Exposed Person">
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {showLabels && "PEP"}
          </Badge>
        </TooltipHelp>
      )}
      
      {flags.is_sanction_list && (
        <TooltipHelp content="Listed on sanctions list">
          <Badge variant="destructive" className="flex items-center gap-1">
            <X className="h-3 w-3" />
            {showLabels && "Sanctioned"}
          </Badge>
        </TooltipHelp>
      )}
      
      {!flags.is_email_confirmed && (
        <TooltipHelp content="Email not confirmed">
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {showLabels && "Unverified Email"}
          </Badge>
        </TooltipHelp>
      )}
      
      {flags.riskScore >= 75 && (
        <TooltipHelp content="High risk user">
          <Badge variant="destructive" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {showLabels && "High Risk"}
          </Badge>
        </TooltipHelp>
      )}
      
      {flags.riskScore < 30 && (
        <TooltipHelp content="Low risk user">
          <Badge variant="success" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
            <Check className="h-3 w-3" />
            {showLabels && "Low Risk"}
          </Badge>
        </TooltipHelp>
      )}
    </div>
  );
};

export default UserFlagsDisplay;
