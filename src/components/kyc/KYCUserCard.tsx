
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Flag, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Shield,
  Phone,
  Mail
} from 'lucide-react';
import { KYCUser, UserFlags } from '@/types/kyc';

interface KYCUserCardProps {
  user: KYCUser & { flags: UserFlags };
  onUserClick: (user: KYCUser & { flags: UserFlags }) => void;
  onFlagUser: (userId: string) => void;
  isFlagged: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
  kycOperations: any;
}

const KYCUserCard: React.FC<KYCUserCardProps> = ({
  user,
  onUserClick,
  onFlagUser,
  isFlagged,
  isSelected,
  onToggleSelection,
  kycOperations
}) => {
  const getRiskBadgeColor = (score: number) => {
    if (score >= 75) return 'destructive';
    if (score >= 50) return 'outline';
    if (score >= 25) return 'secondary';
    return 'default';
  };

  const getKYCStatusIcon = () => {
    if (user.flags.is_email_confirmed && user.identityNumber) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getKYCStatusText = () => {
    if (user.flags.is_email_confirmed && user.identityNumber) {
      return 'Verified';
    }
    return 'Pending';
  };

  return (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelection}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-sm line-clamp-1">{user.fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getKYCStatusIcon()}
                <span className="text-xs text-muted-foreground">{getKYCStatusText()}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onFlagUser(user.id);
            }}
            className={isFlagged ? 'text-red-500' : 'text-muted-foreground'}
          >
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3" onClick={() => onUserClick(user)}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span className="line-clamp-1">{user.email}</span>
        </div>
        
        {user.phoneNumber && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{user.phoneNumber}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          <Badge variant={getRiskBadgeColor(user.flags.riskScore)} className="text-xs">
            Risk: {user.flags.riskScore}
          </Badge>
          
          {user.flags.is_verified_pep && (
            <Badge variant="destructive" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              PEP
            </Badge>
          )}
          
          {user.flags.is_sanction_list && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Sanctioned
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Joined: {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCUserCard;
