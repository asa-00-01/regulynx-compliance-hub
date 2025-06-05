
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import QuickActionsGrid from './QuickActionsGrid';
import CaseCreationSection from './CaseCreationSection';
import UserStatusSection from './UserStatusSection';
import { useComplianceActions } from './hooks/useComplianceActions';
import { ComplianceActionsProps } from './types/complianceActionsTypes';

const ComplianceActionsContainer: React.FC<ComplianceActionsProps> = ({ 
  user, 
  onActionTaken 
}) => {
  const {
    loading,
    handleCreateCase,
    handleFlagUser,
    handleKYCReview,
    handleDocumentReview,
    handleViewTransactions
  } = useComplianceActions(user, onActionTaken);

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
        <QuickActionsGrid
          user={user}
          loading={loading}
          onViewTransactions={handleViewTransactions}
          onKYCReview={handleKYCReview}
          onDocumentReview={handleDocumentReview}
          onFlagUser={handleFlagUser}
        />

        <CaseCreationSection
          loading={loading}
          onCreateCase={handleCreateCase}
        />

        <UserStatusSection user={user} />
      </CardContent>
    </Card>
  );
};

export default ComplianceActionsContainer;
