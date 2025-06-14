
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserFlags } from '@/types/kyc';
import { Shield, AlertTriangle, Check, X, Mail, Clock } from 'lucide-react';
import { TooltipHelp } from '@/components/ui/tooltip-custom';

interface UserFlagsDisplayProps {
  flags: UserFlags;
  showLabels?: boolean;
}

const UserFlagsDisplay: React.FC<UserFlagsDisplayProps> = ({ flags, showLabels = false }) => {
  return (
    <div className="flex gap-1 flex-wrap">
      {flags.is_verified_pep && (
        <TooltipHelp content="This user is a Politically Exposed Person (PEP). PEPs are individuals who hold or have held prominent public positions and require enhanced due diligence and ongoing monitoring due to increased corruption risk.">
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {showLabels && "PEP"}
          </Badge>
        </TooltipHelp>
      )}
      
      {flags.is_sanction_list && (
        <TooltipHelp content="This user appears on one or more sanctions lists and is subject to regulatory restrictions. All transactions and activities must be blocked and reported to authorities immediately.">
          <Badge variant="destructive" className="flex items-center gap-1">
            <X className="h-3 w-3" />
            {showLabels && "Sanctioned"}
          </Badge>
        </TooltipHelp>
      )}
      
      {!flags.is_email_confirmed && (
        <TooltipHelp content="The user's email address has not been verified. Email verification is required for account security and regulatory compliance. Consider restricting account access until verified.">
          <Badge variant="outline" className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {showLabels && "Unverified Email"}
          </Badge>
        </TooltipHelp>
      )}
      
      {flags.riskScore >= 75 && (
        <TooltipHelp content={`High risk user with score ${flags.riskScore}/100. This indicates multiple risk factors requiring immediate attention, enhanced monitoring, and possible transaction restrictions. Review all activities carefully.`}>
          <Badge variant="destructive" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {showLabels && "High Risk"}
          </Badge>
        </TooltipHelp>
      )}
      
      {flags.riskScore >= 50 && flags.riskScore < 75 && (
        <TooltipHelp content={`Medium risk user with score ${flags.riskScore}/100. Regular monitoring recommended with periodic reviews of activities and transactions.`}>
          <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="h-3 w-3" />
            {showLabels && "Medium Risk"}
          </Badge>
        </TooltipHelp>
      )}
      
      {flags.riskScore < 30 && (
        <TooltipHelp content={`Low risk user with score ${flags.riskScore}/100. Standard monitoring applies with routine compliance checks. No immediate action required.`}>
          <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
            <Check className="h-3 w-3" />
            {showLabels && "Low Risk"}
          </Badge>
        </TooltipHelp>
      )}
    </div>
  );
};

export default UserFlagsDisplay;
