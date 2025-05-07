
import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Flag, AlertTriangle } from 'lucide-react';
import { KYCUser, UserFlags } from '@/types/kyc';
import UserDetailModal from './UserDetailModal';
import RiskBadge from '../common/RiskBadge';
import UserFlagsDisplay from './UserFlagsDisplay';

interface UserVerificationTableProps {
  users: (KYCUser & { flags: UserFlags })[];
}

const UserVerificationTable = ({ users }: UserVerificationTableProps) => {
  const [selectedUser, setSelectedUser] = useState<(KYCUser & { flags: UserFlags }) | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewDetails = (user: KYCUser & { flags: UserFlags }) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Identity Number</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Flags</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.fullName}
                  {user.flags.is_verified_pep && (
                    <Badge variant="warning" className="ml-2">PEP</Badge>
                  )}
                  {user.flags.is_sanction_list && (
                    <Badge variant="destructive" className="ml-2">Sanctioned</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.email}
                  {!user.flags.is_email_confirmed && (
                    <Badge variant="outline" className="ml-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Unconfirmed
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{user.identityNumber || <span className="text-muted-foreground italic">Missing</span>}</TableCell>
                <TableCell>{user.dateOfBirth || <span className="text-muted-foreground italic">Missing</span>}</TableCell>
                <TableCell>
                  <UserFlagsDisplay flags={user.flags} />
                </TableCell>
                <TableCell>
                  <RiskBadge score={user.flags.riskScore} />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(user)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Flag className="h-4 w-4 mr-1" />
                      Flag
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
        />
      )}
    </div>
  );
};

export default UserVerificationTable;
