import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComplianceCaseDetails } from '@/types/case';
import { Eye, Edit, UserCheck, FileText, AlertTriangle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCompliance } from '@/context/ComplianceContext';

interface CaseActionButtonsProps {
  caseItem: ComplianceCaseDetails;
  onCaseUpdated?: () => void;
}

const CaseActionButtons: React.FC<CaseActionButtonsProps> = ({ 
  caseItem, 
  onCaseUpdated 
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setSelectedUser, getUserById, state } = useCompliance();

  console.log('CaseActionButtons - Case userId:', caseItem.userId);
  console.log('CaseActionButtons - Available users:', state.users.length);
  console.log('CaseActionButtons - User IDs:', state.users.map(u => u.id));

  const handleViewCase = () => {
    toast({
      title: 'Case Details',
      description: `Viewing details for case ${caseItem.id}`,
    });
  };

  const handleEditCase = () => {
    navigate('/compliance-cases', {
      state: {
        editCase: true,
        caseData: caseItem
      }
    });
  };

  const handleViewUserProfile = () => {
    setLoading('profile');
    try {
      if (!caseItem.userId) {
        toast({
          title: 'No User Associated',
          description: 'This case does not have an associated user',
          variant: 'destructive',
        });
        return;
      }

      // Check if user exists in our compliance context
      const user = getUserById(caseItem.userId);
      console.log('Found user in context:', user ? `${user.fullName} (${user.id})` : 'null');
      
      if (!user) {
        console.error('User not found in compliance context:', {
          searchedUserId: caseItem.userId,
          availableUserIds: state.users.map(u => ({ id: u.id, name: u.fullName }))
        });
        
        toast({
          title: 'User Data Issue',
          description: `User data for ${caseItem.userName} is not available in the system. Please refresh the page or contact support.`,
          variant: 'destructive',
        });
        return;
      }

      // Set the selected user and navigate
      setSelectedUser(caseItem.userId);
      navigate(`/user-case/${caseItem.userId}`, {
        state: {
          returnTo: '/compliance-cases'
        }
      });
      
      toast({
        title: 'User Profile',
        description: `Opening profile for ${caseItem.userName}`,
      });
    } catch (error) {
      console.error('Error in handleViewUserProfile:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while trying to open the user profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleEscalateCase = async () => {
    setLoading('escalate');
    try {
      // In a real app, this would update the case status in the database
      toast({
        title: 'Case Escalated',
        description: `Case ${caseItem.id} has been escalated for senior review`,
        variant: 'default',
      });
      onCaseUpdated?.();
    } finally {
      setLoading(null);
    }
  };

  const handleCloseCase = async () => {
    setLoading('close');
    try {
      // In a real app, this would update the case status in the database
      toast({
        title: 'Case Closed',
        description: `Case ${caseItem.id} has been marked as closed`,
      });
      onCaseUpdated?.();
    } finally {
      setLoading(null);
    }
  };

  const handleCreateSAR = () => {
    navigate('/sar-center', {
      state: {
        createSAR: true,
        caseData: caseItem
      }
    });
    
    toast({
      title: 'SAR Creation',
      description: 'Creating SAR from case data',
    });
  };

  const handleViewDocuments = () => {
    if (caseItem.userId) {
      navigate(`/documents?userId=${caseItem.userId}`);
      toast({
        title: 'Documents',
        description: `Viewing documents for ${caseItem.userName}`,
      });
    } else {
      toast({
        title: 'No User Associated',
        description: 'This case does not have an associated user',
        variant: 'destructive',
      });
    }
  };

  const handleViewTransactions = () => {
    if (caseItem.userId) {
      navigate(`/aml-monitoring?userId=${caseItem.userId}`);
      toast({
        title: 'Transaction History',
        description: `Viewing transactions for ${caseItem.userName}`,
      });
    } else {
      toast({
        title: 'No User Associated',
        description: 'This case does not have an associated user',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewCase}
        disabled={loading === 'view'}
      >
        <Eye className="h-4 w-4 mr-1" />
        View Details
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleEditCase}
        disabled={loading === 'edit'}
      >
        <Edit className="h-4 w-4 mr-1" />
        Edit
      </Button>

      {caseItem.userId && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewUserProfile}
            disabled={loading === 'profile'}
          >
            <UserCheck className="h-4 w-4 mr-1" />
            User Profile
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDocuments}
            disabled={loading === 'documents'}
            className="text-blue-600 hover:text-blue-700"
          >
            <FileText className="h-4 w-4 mr-1" />
            Documents
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleViewTransactions}
            disabled={loading === 'transactions'}
            className="text-purple-600 hover:text-purple-700"
          >
            <FileText className="h-4 w-4 mr-1" />
            Transactions
          </Button>
        </>
      )}

      {caseItem.status === 'open' && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleEscalateCase}
          disabled={loading === 'escalate'}
          className="text-orange-600 hover:text-orange-700"
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Escalate
        </Button>
      )}

      {(caseItem.status === 'open' || caseItem.status === 'under_review') && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCloseCase}
          disabled={loading === 'close'}
          className="text-green-600 hover:text-green-700"
        >
          <Check className="h-4 w-4 mr-1" />
          Close Case
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleCreateSAR}
        disabled={loading === 'sar'}
      >
        <FileText className="h-4 w-4 mr-1" />
        Create SAR
      </Button>
    </div>
  );
};

export default CaseActionButtons;
