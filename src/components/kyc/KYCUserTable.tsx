
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserVerificationTable from '@/components/kyc/UserVerificationTable';
import { KYCUser, UserFlags } from '@/types/kyc';
import { UserRiskData } from '@/hooks/useRiskCalculation';

interface KYCUserTableProps {
  users: (KYCUser & { flags: UserFlags })[];
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: string;
  isLoading: boolean;
  flaggedUsers: string[];
  onFlagUser: (userId: string) => void;
}

const KYCUserTable: React.FC<KYCUserTableProps> = ({
  users,
  onSort,
  sortField,
  sortOrder,
  isLoading,
  flaggedUsers,
  onFlagUser
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          User Verification
          {!isLoading && (
            <span className="text-xs text-muted-foreground ml-2">
              {users.length} user{users.length === 1 ? '' : 's'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UserVerificationTable 
          users={users} 
          onSort={onSort}
          sortField={sortField}
          sortOrder={sortOrder}
          isLoading={isLoading}
          flaggedUsers={flaggedUsers}
          onFlagUser={onFlagUser}
        />
      </CardContent>
    </Card>
  );
};

export default KYCUserTable;
