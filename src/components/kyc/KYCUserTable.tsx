
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserVerificationTable from '@/components/kyc/UserVerificationTable';
import { KYCUser, UserFlags } from '@/types/kyc';
import { UserRiskData } from '@/hooks/useRiskCalculation';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t('kyc.table.title')}
          {!isLoading && (
            <span className="text-xs text-muted-foreground ml-2">
              {t('kyc.table.userCount', { count: users.length })}
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
