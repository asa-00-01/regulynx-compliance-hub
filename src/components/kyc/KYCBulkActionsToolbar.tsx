
import React, { useState } from 'react';
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
  Users,
  Loader2
} from 'lucide-react';
import { KYCUser, UserFlags } from '@/types/kyc';

interface KYCBulkActionsToolbarProps {
  selectedUsers: string[];
  users: (KYCUser & { flags: UserFlags })[];
  onClearSelection: () => void;
  onBulkAction: (action: string, userIds: string[]) => void;
  kycOperations: {
    updateUserKYCStatus?: (userId: string, status: string) => Promise<void>;
    requestAdditionalInfo?: (userId: string, info: string[]) => Promise<void>;
    escalateToCompliance?: (userId: string, reason: string) => Promise<void>;
    generateComplianceReport?: (userIds: string[]) => Promise<void>;
    isProcessing?: (userId: string) => boolean;
  };
}

const KYCBulkActionsToolbar: React.FC<KYCBulkActionsToolbarProps> = ({
  selectedUsers,
  users,
  onClearSelection,
  onBulkAction,
  kycOperations
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const selectedCount = selectedUsers.length;

  if (selectedCount === 0) return null;

  const handleBulkApprove = async () => {
    setIsProcessing(true);
    try {
      // Process all selected users
      await Promise.all(
        selectedUsers.map(userId => 
          kycOperations.updateUserKYCStatus?.(userId, 'verified')
        ).filter(Boolean) // Filter out undefined functions
      );
      onClearSelection();
    } catch (error) {
      console.error('Bulk approve error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    setIsProcessing(true);
    try {
      // Process all selected users
      await Promise.all(
        selectedUsers.map(userId => 
          kycOperations.updateUserKYCStatus?.(userId, 'rejected')
        ).filter(Boolean) // Filter out undefined functions
      );
      onClearSelection();
    } catch (error) {
      console.error('Bulk reject error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkRequestInfo = async () => {
    setIsProcessing(true);
    try {
      // Process all selected users
      await Promise.all(
        selectedUsers.map(userId => 
          kycOperations.requestAdditionalInfo?.(userId, ['Additional documentation required'])
        ).filter(Boolean) // Filter out undefined functions
      );
      onClearSelection();
    } catch (error) {
      console.error('Bulk request info error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkEscalate = async () => {
    setIsProcessing(true);
    try {
      // Process all selected users
      await Promise.all(
        selectedUsers.map(userId => 
          kycOperations.escalateToCompliance?.(userId, 'Bulk escalation from KYC center')
        ).filter(Boolean) // Filter out undefined functions
      );
      onClearSelection();
    } catch (error) {
      console.error('Bulk escalate error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsProcessing(true);
    try {
      await kycOperations.generateComplianceReport?.(selectedUsers);
      onClearSelection();
    } catch (error) {
      console.error('Generate report error:', error);
    } finally {
      setIsProcessing(false);
    }
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
              disabled={isProcessing}
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
              disabled={isProcessing}
              className="h-8"
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="h-3 w-3 mr-1" />
              )}
              Approve All
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkReject}
              disabled={isProcessing}
              className="h-8"
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              Reject All
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkRequestInfo}
              disabled={isProcessing}
              className="h-8"
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <FileText className="h-3 w-3 mr-1" />
              )}
              Request Info
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkEscalate}
              disabled={isProcessing}
              className="h-8"
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <AlertTriangle className="h-3 w-3 mr-1" />
              )}
              Escalate
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateReport}
              disabled={isProcessing}
              className="h-8"
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Download className="h-3 w-3 mr-1" />
              )}
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCBulkActionsToolbar;
