
import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { KYCUser, UserFlags } from '@/types/kyc';
import UserDetailModal from './UserDetailModal';
import UserTableHeader from './table/UserTableHeader';
import UserTableRow from './table/UserTableRow';
import UserTableLoading from './table/UserTableLoading';
import UserTableEmpty from './table/UserTableEmpty';

interface UserVerificationTableProps {
  users: (KYCUser & { flags: UserFlags })[];
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: string;
  isLoading: boolean;
  flaggedUsers: string[];
  onFlagUser: (userId: string) => void;
}

const UserVerificationTable: React.FC<UserVerificationTableProps> = ({
  users,
  onSort,
  sortField,
  sortOrder,
  isLoading,
  flaggedUsers,
  onFlagUser
}) => {
  const [selectedUser, setSelectedUser] = useState<(KYCUser & { flags: UserFlags }) | null>(null);

  const handleViewDetails = (user: KYCUser & { flags: UserFlags }) => {
    setSelectedUser(user);
  };

  if (isLoading) {
    return <UserTableLoading />;
  }

  if (users.length === 0) {
    return <UserTableEmpty />;
  }

  return (
    <div className="space-y-4">
      <Table>
        <UserTableHeader
          onSort={onSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />
        <TableBody>
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              flaggedUsers={flaggedUsers}
              onFlagUser={onFlagUser}
              onViewDetails={handleViewDetails}
            />
          ))}
        </TableBody>
      </Table>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default UserVerificationTable;
