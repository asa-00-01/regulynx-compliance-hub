
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
  const { setSelectedUser } = useCompliance();

  const handleViewCase = () => {
    navigate(`/case-details/${caseItem.id}`);
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
    if (caseItem.userId) {
      setSelectedUser(caseItem.userId);
      navigate(`/user-case/${caseItem.userId}`);
      toast({
        title: 'User Profile',
        description: `Opening profile for ${caseItem.userName}`,
      });
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewUserProfile}
          disabled={loading === 'profile'}
        >
          <UserCheck className="h-4 w-4 mr-1" />
          User Profile
        </Button>
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
