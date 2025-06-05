
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserStatusSectionProps {
  user: any;
}

const UserStatusSection: React.FC<UserStatusSectionProps> = ({ user }) => {
  return (
    <div className="border-t pt-4">
      <h4 className="text-sm font-medium mb-3">Current Status</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span>KYC Status:</span>
          <Badge variant={user.kycStatus === 'verified' ? 'default' : 'secondary'} size="sm">
            {user.kycStatus}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>PEP Status:</span>
          <Badge variant={user.isPEP ? 'destructive' : 'outline'} size="sm">
            {user.isPEP ? 'Yes' : 'No'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Sanctions:</span>
          <Badge variant={user.isSanctioned ? 'destructive' : 'outline'} size="sm">
            {user.isSanctioned ? 'Sanctioned' : 'Clear'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Country:</span>
          <Badge variant="outline" size="sm">
            {user.countryOfResidence}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default UserStatusSection;
