
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { UnifiedUserData } from '@/context/compliance/types';
import { useCompliance } from '@/context/ComplianceContext';

export function useComplianceActions(user: UnifiedUserData, onActionTaken?: () => void) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setSelectedUser } = useCompliance();

  const handleCreateCase = async () => {
    setLoading('case');
    try {
      navigate('/compliance-cases', {
        state: {
          createCase: true,
          userData: {
            userId: user.id,
            userName: user.fullName,
            description: `Compliance review for ${user.fullName} - Risk Score: ${user.riskScore}`,
            type: 'compliance',
            source: 'user_profile',
            riskScore: user.riskScore,
          }
        }
      });

      toast({
        title: 'Case Created',
        description: `Compliance case created for ${user.fullName}`,
      });
      
      onActionTaken?.();
    } finally {
      setLoading(null);
    }
  };

  const handleFlagUser = async () => {
    setLoading('flag');
    try {
      // In a real app, this would update the user status in the database
      toast({
        title: 'User Flagged',
        description: `${user.fullName} has been flagged for review`,
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
        state: {
          userId: user.id,
          userName: user.fullName,
          currentStatus: user.kycStatus
        }
      });

      toast({
        title: 'KYC Review',
        description: `Opening KYC verification for ${user.fullName}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDocumentReview = async () => {
    setLoading('documents');
    try {
      navigate(`/documents?userId=${user.id}`);

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
        title: 'Transaction History',
        description: `Viewing transactions for ${user.fullName}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleCreateSAR = async () => {
    setLoading('sar');
    try {
      navigate('/sar-center', {
        state: {
          createSAR: true,
          userData: user
        }
      });

      toast({
        title: 'SAR Creation',
        description: 'Navigating to create Suspicious Activity Report',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleViewFullProfile = async () => {
    setLoading('profile');
    try {
      setSelectedUser(user.id);
      navigate(`/user-case/${user.id}`);
      
      toast({
        title: 'Full Profile',
        description: `Opening complete profile for ${user.fullName}`,
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
    handleViewTransactions,
    handleCreateSAR,
    handleViewFullProfile
  };
}
