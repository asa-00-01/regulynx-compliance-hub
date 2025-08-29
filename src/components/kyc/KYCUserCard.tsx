
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
  Mail,
  Loader2,
  FileText
} from 'lucide-react';
import { KYCUser, UserFlags } from '@/types/kyc';

interface KYCUserCardProps {
  user: KYCUser & { flags: UserFlags; kycStatus?: string };
  onUserClick: (user: KYCUser & { flags: UserFlags; kycStatus?: string }) => void;
  onFlagUser: (userId: string) => void;
  isFlagged: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
  kycOperations: {
    isProcessing?: (userId: string) => boolean;
    updateUserKYCStatus?: (userId: string, status: string) => Promise<void>;
    requestAdditionalInfo?: (userId: string, info: string[]) => Promise<void>;
    escalateToCompliance?: (userId: string, reason: string) => Promise<void>;
  };
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
  const isProcessing = kycOperations?.isProcessing?.(user.id) || false;

  const getRiskBadgeColor = (score: number) => {
    if (score >= 75) return 'destructive';
    if (score >= 50) return 'outline';
    if (score >= 25) return 'secondary';
    return 'default';
  };

  const getKYCStatusIcon = () => {
    if (isProcessing) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    
    // Use the actual kycStatus from the database instead of deriving from flags
    // The kycStatus should be available in the user object from the compliance context
    const kycStatus = user.kycStatus || (user.flags.is_email_confirmed && user.identityNumber ? 'verified' : 'pending');
    
    switch (kycStatus) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'information_requested':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getKYCStatusText = () => {
    if (isProcessing) {
      return 'Processing...';
    }
    
    // Use the actual kycStatus from the database instead of deriving from flags
    const kycStatus = user.kycStatus || (user.flags.is_email_confirmed && user.identityNumber ? 'verified' : 'pending');
    return kycStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${isProcessing ? 'opacity-75' : ''}`}
      onClick={() => !isProcessing && onUserClick(user)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelection}
              onClick={(e) => e.stopPropagation()}
              disabled={isProcessing}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-sm line-clamp-1">{user.fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getKYCStatusIcon()}
                <span className={`text-xs ${isProcessing ? 'text-blue-600' : 'text-muted-foreground'}`}>
                  {getKYCStatusText()}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (!isProcessing) {
                onFlagUser(user.id);
              }
            }}
            disabled={isProcessing}
            className={isFlagged ? 'text-red-500' : 'text-muted-foreground'}
          >
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
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

        {/* Individual Action Buttons */}
        <div className="flex flex-wrap gap-1 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              kycOperations.updateUserKYCStatus?.(user.id, 'verified');
            }}
            disabled={isProcessing}
            className="h-6 px-2 text-xs"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Approve
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              kycOperations.updateUserKYCStatus?.(user.id, 'rejected');
            }}
            disabled={isProcessing}
            className="h-6 px-2 text-xs"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Reject
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              kycOperations.requestAdditionalInfo?.(user.id, ['Additional documentation required']);
            }}
            disabled={isProcessing}
            className="h-6 px-2 text-xs"
          >
            <FileText className="h-3 w-3 mr-1" />
            Request Info
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              kycOperations.escalateToCompliance?.(user.id, 'Escalated from KYC center');
            }}
            disabled={isProcessing}
            className="h-6 px-2 text-xs"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Escalate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCUserCard;
