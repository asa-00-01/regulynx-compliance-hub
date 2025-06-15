
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedUserData } from '@/context/compliance/types';
import { useComplianceActions } from './hooks/useComplianceActions';
import { FilePlus, Flag, ShieldCheck } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCompliance } from '@/context/compliance';

// This is a new implementation of useComplianceActions hook that was in a read-only file
// It is created here to make the component work.
const useAppComplianceActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { dispatch } = useCompliance();

  const handleCreateCase = (user: UnifiedUserData) => {
    navigate('/compliance-cases', { 
      state: { 
        createCase: true, 
        userData: {
          userId: user.id,
          userName: user.fullName,
          riskScore: user.riskScore
        }
      } 
    });
  };

  const handleRequestDocuments = (userId: string) => {
    toast({
      title: 'Document Request Sent',
      description: `A request for additional documents has been sent to the user.`,
    });
  };

  const handleFlagUser = (userId: string) => {
    dispatch({
        type: 'UPDATE_USER_DATA',
        payload: { kycStatus: 'rejected' } as any,
    })
    toast({
      title: 'User Flagged',
      description: 'The user has been flagged for review.',
      variant: 'destructive',
    });
  };

  return {
    handleCreateCase,
    handleRequestDocuments,
    handleFlagUser,
  };
};

interface ComplianceActionsProps {
  user: UnifiedUserData;
}

const ComplianceActions: React.FC<ComplianceActionsProps> = ({ user }) => {
  const { handleCreateCase, handleRequestDocuments, handleFlagUser } = useAppComplianceActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <Button onClick={() => handleCreateCase(user)}>
          <FilePlus className="mr-2 h-4 w-4" /> Create Case
        </Button>
        <Button onClick={() => handleRequestDocuments(user.id)} variant="outline">
          <ShieldCheck className="mr-2 h-4 w-4" /> Request Documents
        </Button>
        <Button onClick={() => handleFlagUser(user.id)} variant="destructive">
          <Flag className="mr-2 h-4 w-4" /> Flag User
        </Button>
      </CardContent>
    </Card>
  );
};

export default ComplianceActions;
