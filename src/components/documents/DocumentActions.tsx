
import React from 'react';
import { Button } from '@/components/ui/button';
import { Document } from '@/types/supabase';
import { Eye, Download, FileText, User, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCompliance } from '@/context/ComplianceContext';
import { TooltipHelp } from '@/components/ui/tooltip-custom';

interface DocumentActionsProps {
  document: Document;
  onViewDocument: (doc: Document) => void;
  onReviewDocument: (doc: Document) => void;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  document,
  onViewDocument,
  onReviewDocument
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setSelectedUser } = useCompliance();

  const handleDownload = () => {
    // In a real app, this would download the document from storage
    toast({
      title: "Download Started",
      description: `Downloading ${document.file_name}`,
    });
  };

  const handleViewUserProfile = () => {
    setSelectedUser(document.user_id);
    navigate(`/user-case/${document.user_id}`, {
      state: {
        returnTo: '/documents'
      }
    });
    
    toast({
      title: "User Profile",
      description: "Opening user profile",
    });
  };

  const handleCreateCase = () => {
    navigate('/compliance-cases', {
      state: {
        createCase: true,
        userData: {
          userId: document.user_id,
          userName: 'Document Owner',
          description: `Document verification issue: ${document.file_name}`,
          type: 'document_verification',
          source: 'document_review',
          riskScore: document.status === 'rejected' ? 75 : 25,
        }
      }
    });

    toast({
      title: "Case Created",
      description: "Investigation case created for document issue",
    });
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <TooltipHelp content="View the document content and details in a modal window">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDocument(document)}
          title="View Document"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TooltipHelp>
      
      <TooltipHelp content="Download the original document file to your computer">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          title="Download Document"
        >
          <Download className="h-4 w-4" />
        </Button>
      </TooltipHelp>
      
      <TooltipHelp content="Open the document verification interface to review extracted data and approve or reject the document">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReviewDocument(document)}
          title="Review Document"
        >
          <FileText className="h-4 w-4" />
        </Button>
      </TooltipHelp>
      
      <TooltipHelp content="Navigate to the user's profile to view their complete information and compliance history">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewUserProfile}
          title="View User Profile"
        >
          <User className="h-4 w-4" />
        </Button>
      </TooltipHelp>
      
      {(document.status === 'rejected' || document.status === 'pending') && (
        <TooltipHelp content="Create an investigation case for document-related compliance issues that require further review">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateCase}
            title="Create Investigation Case"
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
        </TooltipHelp>
      )}
    </div>
  );
};

export default DocumentActions;
