
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Flag, 
  AlertTriangle, 
  Shield, 
  User,
  Mail,
  Calendar,
  Phone,
  CreditCard
} from 'lucide-react';
import { KYCUser, UserFlags } from '@/types/kyc';

interface UserTableRowProps {
  user: KYCUser & { flags: UserFlags };
  flaggedUsers: string[];
  onFlagUser: (userId: string) => void;
  onViewDetails: (user: KYCUser & { flags: UserFlags }) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  flaggedUsers,
  onFlagUser,
  onViewDetails
}) => {
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

  return (
    <TableRow className="hover:bg-muted/50">
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
            onClick={() => onViewDetails(user)}
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
  );
};

export default UserTableRow;
