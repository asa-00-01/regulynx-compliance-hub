
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { LoadingState, CaseType, NavigationParams } from '../types/complianceActionsTypes';

export function useComplianceActions(user: any, onActionTaken?: () => void) {
  const [loading, setLoading] = useState<LoadingState>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateCase = async (caseType: CaseType) => {
    setLoading('createCase');
    try {
      const navigationParams: NavigationParams = {
        userId: user.id,
        userName: user.fullName,
        description: `${caseType} case for user: ${user.fullName} (Risk Score: ${user.riskScore})`,
        type: caseType,
        source: 'compliance_review',
        riskScore: user.riskScore,
      };

      navigate('/compliance-cases', {
        state: {
          createCase: true,
          userData: navigationParams
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

  return {
    loading,
    handleCreateCase,
    handleFlagUser,
    handleKYCReview,
    handleDocumentReview,
    handleViewTransactions
  };
}
