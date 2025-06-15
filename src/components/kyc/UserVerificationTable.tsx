
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Eye, 
  Flag, 
  AlertTriangle, 
  Shield, 
  ChevronUp, 
  ChevronDown,
  User,
  Mail,
  Calendar,
  MapPin,
  Phone,
  CreditCard
} from 'lucide-react';
import { KYCUser, UserFlags } from '@/types/kyc';
import UserDetailModal from './UserDetailModal';

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

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 75) return 'destructive';
    if (score >= 50) return 'default';
    if (score >= 25) return 'secondary';
    return 'outline';
  };

  const getRiskBadgeText = (score: number) => {
    if (score >= 75) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    if (score >= 25) return 'Low Risk';
    return 'Minimal Risk';
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const handleViewDetails = (user: KYCUser & { flags: UserFlags }) => {
    setSelectedUser(user);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-8 w-[80px]" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No users found</h3>
        <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer select-none"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center gap-2">
                User Information
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead>Contact Details</TableHead>
            <TableHead 
              className="cursor-pointer select-none"
              onClick={() => onSort('risk')}
            >
              <div className="flex items-center gap-2">
                Risk Assessment
                {getSortIcon('risk')}
              </div>
            </TableHead>
            <TableHead>Verification Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {user.identityNumber || 'No ID provided'}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm flex items-center gap-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {user.email}
                  </div>
                  {user.phoneNumber && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {user.phoneNumber}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {user.dateOfBirth || 'DOB not provided'}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-2">
                  <Badge variant={getRiskBadgeVariant(user.flags.riskScore)}>
                    {user.flags.riskScore} - {getRiskBadgeText(user.flags.riskScore)}
                  </Badge>
                  <div className="flex gap-1">
                    {user.flags.is_verified_pep && (
                      <Badge variant="outline" className="text-xs">
                        PEP
                      </Badge>
                    )}
                    {user.flags.is_sanction_list && (
                      <Badge variant="destructive" className="text-xs">
                        Sanctioned
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-2">
                  <Badge variant={user.flags.is_email_confirmed ? 'default' : 'secondary'}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user.flags.is_email_confirmed ? 'Verified' : 'Pending'}
                  </Badge>
                  {!user.flags.is_email_confirmed && (
                    <div className="text-xs text-muted-foreground">
                      Email not confirmed
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(user)}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFlagUser(user.id)}
                    className={flaggedUsers.includes(user.id) ? 'text-red-600' : ''}
                    title={flaggedUsers.includes(user.id) ? 'Unflag User' : 'Flag User'}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                  
                  {(user.flags.riskScore > 70 || user.flags.is_sanction_list) && (
                    <span title="High Risk Alert">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </span>
                  )}
                </div>
              </TableCell>
            </TableRow>
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
