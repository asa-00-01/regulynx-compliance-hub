
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserFlags } from '@/types/kyc';

interface UserFlagsDisplayProps {
  flags: UserFlags;
  detailed?: boolean;
}

const UserFlagsDisplay = ({ flags, detailed = false }: UserFlagsDisplayProps) => {
  if (detailed) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm font-semibold">Registered</span>
            <Badge variant={flags.is_registered ? "default" : "outline"}>
              {flags.is_registered ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm font-semibold">Email Confirmed</span>
            <Badge variant={flags.is_email_confirmed ? "default" : "destructive"}>
              {flags.is_email_confirmed ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm font-semibold">PEP Status</span>
            <Badge variant={flags.is_verified_pep ? "warning" : "outline"}>
              {flags.is_verified_pep ? "PEP" : "Not PEP"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm font-semibold">Sanction List</span>
            <Badge variant={flags.is_sanction_list ? "destructive" : "outline"}>
              {flags.is_sanction_list ? "Listed" : "Not Listed"}
            </Badge>
          </div>
        </div>
        
        <div className="p-2 bg-muted rounded">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Risk Score</span>
            <Badge variant={
              flags.riskScore >= 75 ? "destructive" :
              flags.riskScore >= 50 ? "warning" :
              flags.riskScore >= 25 ? "secondary" : "outline"
            }>
              {flags.riskScore}/100
            </Badge>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {!flags.is_email_confirmed && (
        <Badge variant="outline">Unconfirmed Email</Badge>
      )}
      
      {flags.is_verified_pep && (
        <Badge variant="warning">PEP</Badge>
      )}
      
      {flags.is_sanction_list && (
        <Badge variant="destructive">Sanctioned</Badge>
      )}
    </div>
  );
};

export default UserFlagsDisplay;
