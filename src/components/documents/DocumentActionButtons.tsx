
import React from 'react';
import { Button } from '@/components/ui/button';
import { DocumentStatus, Document } from '@/types/supabase';
import { Check, X, Eye, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createAuditLog, supabase } from '@/integrations/supabase/client';
import { useFeatureAccess } from '@/hooks/use-permissions';

interface DocumentActionButtonsProps {
  documentId?: string;
  document?: Document;
  currentStatus?: DocumentStatus;
  onStatusChange?: (documentId: string, newStatus: DocumentStatus) => void;
  onViewDocument?: (doc: Document) => void;
  onReviewDocument?: (doc: Document) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const DocumentActionButtons = ({ 
  documentId,
  document,
  currentStatus,
  onStatusChange,
  onViewDocument,
  onReviewDocument,
  size = 'default'
}: DocumentActionButtonsProps) => {
  const { toast } = useToast();
  const { canApproveDocuments } = useFeatureAccess();
  
  const id = document?.id || documentId || '';
  const status = document?.status || currentStatus || 'pending';
  
  const updateDocumentStatus = async (newStatus: DocumentStatus) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to perform this action.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('documents')
        .update({
          status: newStatus,
          verified_by: user.id,
          verification_date: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      
      await createAuditLog({
        action: newStatus === 'verified' ? 'Document Approved' : 'Document Rejected',
        entity: 'document',
        entity_id: id,
        user_id: user.id,
        details: { status: newStatus }
      });
      
      toast({
        title: `Document ${newStatus === 'verified' ? 'approved' : 'rejected'}`,
        description: `The document has been ${newStatus === 'verified' ? 'approved' : 'rejected'} successfully.`,
      });
      
      if (onStatusChange) {
        onStatusChange(id, newStatus);
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      toast({
        title: "Error updating document",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  const showApprovalButtons = status === 'pending' && canApproveDocuments();
  
  return (
    <div className="flex gap-2">
      {onViewDocument && document && (
        <Button
          variant="outline"
          size={size}
          onClick={() => onViewDocument(document)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      )}
      
      {onReviewDocument && document && status === 'pending' && canApproveDocuments() && (
        <Button
          variant="default"
          size={size}
          onClick={() => onReviewDocument(document)}
        >
          <FileText className="h-4 w-4 mr-1" />
          Review
        </Button>
      )}
      
      {showApprovalButtons && (
        <>
          <Button
            variant="outline"
            size={size}
            className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
            onClick={() => updateDocumentStatus('verified')}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            variant="outline"
            size={size}
            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={() => updateDocumentStatus('rejected')}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </>
      )}
    </div>
  );
};

export default DocumentActionButtons;
