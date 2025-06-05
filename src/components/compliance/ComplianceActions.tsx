
import React from 'react';
import ComplianceActionsContainer from './ComplianceActionsContainer';
import { UnifiedUserData } from '@/context/compliance/types';

interface ComplianceActionsProps {
  user: UnifiedUserData;
  onActionTaken?: () => void;
}

const ComplianceActions: React.FC<ComplianceActionsProps> = ({ user, onActionTaken }) => {
  return <ComplianceActionsContainer user={user} onActionTaken={onActionTaken} />;
};

export default ComplianceActions;
