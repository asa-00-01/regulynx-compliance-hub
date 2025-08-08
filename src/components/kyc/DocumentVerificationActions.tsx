
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Download,
  Eye,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Document } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DocumentVerificationActionsProps {
  document: Document;
  onVerify: (documentId: string, reason?: string) => void;
  onReject: (documentId: string, reason: string) => void;
  onRequestInfo: (documentId: string) => void;
  onView: (document: Document) => void;
  disabled?: boolean;
}

const DocumentVerificationActions: React.FC<DocumentVerificationActionsProps> = ({
  document,
  onVerify,
  onReject,
  onRequestInfo,
  onView,
  disabled = false
}) => {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Document download will begin shortly."
    });
  };

  const handleQuickVerify = () => {
    onVerify(document.id, 'Document verified after review');
  };

  const handleQuickReject = () => {
    // For quick reject, we'll need a reason dialog or use a default reason
    onView(document); // Open modal for detailed review
  };

  if (document.status === 'verified') {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
        <Button variant="outline" size="sm" onClick={() => onView(document)}>
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
      </div>
    );
  }

  if (document.status === 'rejected') {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
        <Button variant="outline" size="sm" onClick={() => onView(document)}>
          <FileText className="h-3 w-3 mr-1" />
          Details
        </Button>
      </div>
    );
  }

  if (document.status === 'information_requested') {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
        <Button variant="outline" size="sm" onClick={() => onView(document)}>
          <AlertCircle className="h-3 w-3 mr-1" />
          Review
        </Button>
      </div>
    );
  }

  // Pending status - show verification actions
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDownload}
        disabled={disabled}
      >
        <Download className="h-3 w-3 mr-1" />
        Download
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onRequestInfo(document.id)}
        disabled={disabled}
        className="text-yellow-600 hover:text-yellow-700"
      >
        <MessageSquare className="h-3 w-3 mr-1" />
        Request Info
      </Button>
      
      <Button 
        size="sm" 
        onClick={() => onView(document)}
        disabled={disabled}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Eye className="h-3 w-3 mr-1" />
        Review
      </Button>
    </div>
  );
};

export default DocumentVerificationActions;
