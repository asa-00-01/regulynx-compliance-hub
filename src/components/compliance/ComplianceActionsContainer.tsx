
import React from 'react';
import { UnifiedUserData } from '@/context/compliance/types';
import { useComplianceActions } from './hooks/useComplianceActions';
import { Button } from '@/components/ui/button';

interface ComplianceActionsContainerProps {
  user: UnifiedUserData;
  onActionTaken?: () => void;
}

type LoadingState = string | null;

const ComplianceActionsContainer: React.FC<ComplianceActionsContainerProps> = ({
  user,
  onActionTaken
}) => {
  const {
    loading,
    handleCreateCase,
    handleFlagUser,
    handleKYCReview,
    handleDocumentReview,
    handleViewTransactions,
    handleCreateSAR,
    handleViewFullProfile
  } = useComplianceActions(user, onActionTaken);

  const actions = [
    {
      label: 'View Full Profile',
      onClick: handleViewFullProfile,
      loading: loading === 'profile' as LoadingState,
      variant: 'default' as const
    },
    {
      label: 'Create Case',
      onClick: handleCreateCase,
      loading: loading === 'case' as LoadingState,
      variant: 'default' as const
    },
    {
      label: 'Flag User',
      onClick: handleFlagUser,
      loading: loading === 'flag' as LoadingState,
      variant: 'destructive' as const
    },
    {
      label: 'KYC Review',
      onClick: handleKYCReview,
      loading: loading === 'kyc' as LoadingState,
      variant: 'outline' as const
    },
    {
      label: 'View Documents',
      onClick: handleDocumentReview,
      loading: loading === 'documents' as LoadingState,
      variant: 'outline' as const
    },
    {
      label: 'View Transactions',
      onClick: handleViewTransactions,
      loading: loading === 'transactions' as LoadingState,
      variant: 'outline' as const
    },
    {
      label: 'Create SAR',
      onClick: handleCreateSAR,
      loading: loading === 'sar' as LoadingState,
      variant: 'outline' as const
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant}
          onClick={action.onClick}
          disabled={action.loading}
          className="text-sm"
        >
          {action.loading ? 'Loading...' : action.label}
        </Button>
      ))}
    </div>
  );
};

export default ComplianceActionsContainer;
