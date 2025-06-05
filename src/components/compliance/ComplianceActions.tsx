
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileText, Shield, Search, UserCheck, Flag } from 'lucide-react';
import { UnifiedUserData } from '@/context/compliance/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ComplianceActionsProps {
  user: UnifiedUserData;
  onActionTaken?: () => void;
}

const ComplianceActions: React.FC<ComplianceActionsProps> = ({ user, onActionTaken }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateCase = async (caseType: string) => {
    setLoading('createCase');
    try {
      // Navigate to compliance cases page with initial case data
      navigate('/compliance-cases', {
        state: {
          createCase: true,
          userData: {
            userId: user.id,
            userName: user.fullName,
            description: `${caseType} case for user: ${user.fullName} (Risk Score: ${user.riskScore})`,
            type: caseType,
            source: 'compliance_review',
            riskScore: user.riskScore,
          }
        }
      });

      toast({
        title: 'Case Creation',
        description: `Navigating to create ${caseType} case for ${user.fullName}`,
      });

      onActionTaken?.();
    } finally {
      setLoading(null);
    }
  };

  const handleFlagUser = async () => {
    setLoading('flag');
    try {
      // In a real app, this would update the user's flag status in the database
      toast({
        title: 'User Flagged',
        description: `${user.fullName} has been flagged for compliance review`,
        variant: 'destructive',
      });
      onActionTaken?.();
    } finally {
      setLoading(null);
    }
  };

  const handleKYCReview = async () => {
    setLoading('kyc');
    try {
      navigate('/kyc-verification', {
        state: { selectedUserId: user.id }
      });
      toast({
        title: 'KYC Review',
        description: `Opening KYC review for ${user.fullName}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDocumentReview = async () => {
    setLoading('documents');
    try {
      navigate('/documents', {
        state: { filterUserId: user.id }
      });
      toast({
        title: 'Document Review',
        description: `Opening document review for ${user.fullName}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleViewTransactions = async () => {
    setLoading('transactions');
    try {
      navigate(`/aml-monitoring?userId=${user.id}`);
      toast({
        title: 'Transaction Review',
        description: `Opening transaction monitoring for ${user.fullName}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const getRiskLevelColor = () => {
    if (user.riskScore >= 75) return 'destructive';
    if (user.riskScore >= 50) return 'warning';
    if (user.riskScore >= 25) return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Actions
          </span>
          <Badge variant={getRiskLevelColor()}>
            Risk Score: {user.riskScore}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewTransactions}
            disabled={loading === 'transactions'}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            View Transactions
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleKYCReview}
            disabled={loading === 'kyc'}
            className="flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            KYC Review
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDocumentReview}
            disabled={loading === 'documents'}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Review Documents
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Flag className="h-4 w-4" />
                Flag User
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Flag User for Review</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to flag {user.fullName} for compliance review? 
                  This will mark the user as requiring immediate attention.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleFlagUser}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Flag User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Case Creation Actions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Create Compliance Case
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreateCase('aml')}
              disabled={loading === 'createCase'}
              className="justify-start"
            >
              AML Investigation Case
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreateCase('kyc')}
              disabled={loading === 'createCase'}
              className="justify-start"
            >
              KYC Compliance Case
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreateCase('sanctions')}
              disabled={loading === 'createCase'}
              className="justify-start"
            >
              Sanctions Screening Case
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreateCase('fraud')}
              disabled={loading === 'createCase'}
              className="justify-start"
            >
              Fraud Investigation Case
            </Button>
          </div>
        </div>

        {/* User Status Indicators */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Current Status</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>KYC Status:</span>
              <Badge variant={user.kycStatus === 'verified' ? 'default' : 'secondary'} size="sm">
                {user.kycStatus}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>PEP Status:</span>
              <Badge variant={user.isPEP ? 'destructive' : 'outline'} size="sm">
                {user.isPEP ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Sanctions:</span>
              <Badge variant={user.isSanctioned ? 'destructive' : 'outline'} size="sm">
                {user.isSanctioned ? 'Sanctioned' : 'Clear'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Country:</span>
              <Badge variant="outline" size="sm">
                {user.countryOfResidence}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceActions;
