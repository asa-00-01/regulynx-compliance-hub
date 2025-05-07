
import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Flag, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';
import { KYCUser, UserFlags } from '@/types/kyc';
import UserDetailModal from './UserDetailModal';
import RiskBadge from '../common/RiskBadge';
import UserFlagsDisplay from './UserFlagsDisplay';
import { TooltipHelp } from '@/components/ui/tooltip-custom';
import { useRiskCalculation } from '@/hooks/useRiskCalculation';

interface UserVerificationTableProps {
  users: (KYCUser & { flags: UserFlags })[];
  onSort?: (field: string) => void;
  sortField?: string;
  sortOrder?: string;
}

const UserVerificationTable = ({ users, onSort, sortField = 'name', sortOrder = 'asc' }: UserVerificationTableProps) => {
  const [selectedUser, setSelectedUser] = useState<(KYCUser & { flags: UserFlags }) | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewDetails = (user: KYCUser & { flags: UserFlags }) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const SortableHeader = ({ field, children }: { field: string, children: React.ReactNode }) => {
    const isActive = sortField === field;
    return (
      <div 
        className="flex items-center cursor-pointer" 
        onClick={() => onSort && onSort(field)}
      >
        {children}
        {isActive && (
          <span className="ml-1">
            {sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortableHeader field="name">Full Name</SortableHeader>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Identity Number</TableHead>
            <TableHead>Flags</TableHead>
            <TableHead>
              <SortableHeader field="risk">Risk Score</SortableHeader>
            </TableHead>
            <TableHead>Transactions</TableHead>
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
            users.map((user) => {
              const riskData = useRiskCalculation(user);
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.fullName}
                    {user.flags.is_verified_pep && (
                      <TooltipHelp content="Politically Exposed Person - Enhanced due diligence required">
                        <Badge variant="warning" className="ml-2">PEP</Badge>
                      </TooltipHelp>
                    )}
                    {user.flags.is_sanction_list && (
                      <TooltipHelp content="This user appears on a sanctions list - All transactions are blocked">
                        <Badge variant="destructive" className="ml-2">Sanctioned</Badge>
                      </TooltipHelp>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.email}
                    {!user.flags.is_email_confirmed && (
                      <TooltipHelp content="Email address has not been verified">
                        <Badge variant="outline" className="ml-2">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Unconfirmed
                        </Badge>
                      </TooltipHelp>
                    )}
                  </TableCell>
                  <TableCell>{user.identityNumber || <span className="text-muted-foreground italic">Missing</span>}</TableCell>
                  <TableCell>
                    <UserFlagsDisplay flags={user.flags} />
                  </TableCell>
                  <TableCell>
                    <TooltipHelp content={
                      <>
                        <div className="font-medium mb-1">Risk factors:</div>
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                          {riskData.riskFactors.highAmount && <li>High transaction amount</li>}
                          {riskData.riskFactors.highRiskCountry && <li>High-risk countries</li>}
                          {riskData.riskFactors.highFrequency && <li>High transaction frequency</li>}
                          {riskData.riskFactors.incompleteKYC && <li>Incomplete KYC information</li>}
                        </ul>
                      </>
                    }>
                      <RiskBadge score={user.flags.riskScore} />
                    </TooltipHelp>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{riskData.transactionCount} transactions</span>
                      <span className="text-xs text-muted-foreground">
                        Last: {riskData.recentTransactionAmount.toLocaleString()} SEK
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(user)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        disabled={user.flags.is_sanction_list}
                        title={user.flags.is_sanction_list ? "Actions limited for sanctioned users" : "Flag user for review"}
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        Flag
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
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
