
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  AlertTriangle, 
  Download,
  X,
  Users
} from 'lucide-react';
import { KYCUser, UserFlags } from '@/types/kyc';

interface KYCBulkActionsToolbarProps {
  selectedUsers: string[];
  users: (KYCUser & { flags: UserFlags })[];
  onClearSelection: () => void;
  onBulkAction: (action: string, userIds: string[]) => void;
  kycOperations: any;
}

const KYCBulkActionsToolbar: React.FC<KYCBulkActionsToolbarProps> = ({
  selectedUsers,
  users,
  onClearSelection,
  onBulkAction,
  kycOperations
}) => {
  const selectedCount = selectedUsers.length;

  if (selectedCount === 0) return null;

  const handleBulkApprove = () => {
    selectedUsers.forEach(userId => {
      kycOperations.updateUserKYCStatus?.(userId, 'verified');
    });
    onClearSelection();
  };

  const handleBulkReject = () => {
    selectedUsers.forEach(userId => {
      kycOperations.updateUserKYCStatus?.(userId, 'rejected');
    });
    onClearSelection();
  };

  const handleBulkRequestInfo = () => {
    selectedUsers.forEach(userId => {
      kycOperations.requestAdditionalInfo?.(userId, ['Additional documentation required']);
    });
    onClearSelection();
  };

  const handleBulkEscalate = () => {
    selectedUsers.forEach(userId => {
      kycOperations.escalateToCompliance?.(userId, 'Bulk escalation');
    });
    onClearSelection();
  };

  const handleGenerateReport = () => {
    kycOperations.generateComplianceReport?.(selectedUsers);
    onClearSelection();
  };

  return (
    <Card className="mb-4 border-primary/20 bg-primary/5">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <Badge variant="secondary">{selectedCount} selected</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={handleBulkApprove}
              className="h-8"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Approve All
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkReject}
              className="h-8"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Reject All
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkRequestInfo}
              className="h-8"
            >
              <FileText className="h-3 w-3 mr-1" />
              Request Info
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkEscalate}
              className="h-8"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Escalate
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateReport}
              className="h-8"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCBulkActionsToolbar;
