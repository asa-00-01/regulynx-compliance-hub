
import React from 'react';
import { Button } from '@/components/ui/button';
import { DocumentStatus } from '@/types/supabase';
import { Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createAuditLog, supabase } from '@/integrations/supabase/client';

interface DocumentActionButtonsProps {
  documentId: string;
  currentStatus: DocumentStatus;
  onStatusChange?: (documentId: string, newStatus: DocumentStatus) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const DocumentActionButtons = ({ 
  documentId, 
  currentStatus, 
  onStatusChange,
  size = 'default'
}: DocumentActionButtonsProps) => {
  const { toast } = useToast();
  
  const updateDocumentStatus = async (newStatus: DocumentStatus) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to perform this action.",
          variant: "destructive",
        });
        return;
      }
      
      // Update document status
      const { error } = await supabase
        .from('documents')
        .update({
          status: newStatus,
          verified_by: user.id,
          verification_date: new Date().toISOString(),
        })
        .eq('id', documentId);
      
      if (error) throw error;
      
      // Create audit log
      await createAuditLog({
        action: newStatus === 'verified' ? 'Document Approved' : 'Document Rejected',
        entity: 'document',
        entity_id: documentId,
        user_id: user.id,
        details: { status: newStatus }
      });
      
      // Show success message
      toast({
        title: `Document ${newStatus === 'verified' ? 'approved' : 'rejected'}`,
        description: `The document has been ${newStatus === 'verified' ? 'approved' : 'rejected'} successfully.`,
      });
      
      // Call callback if provided
      if (onStatusChange) {
        onStatusChange(documentId, newStatus);
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
  
  // Don't show buttons if already verified or rejected
  if (currentStatus !== 'pending') {
    return null;
  }
  
  return (
    <div className="flex gap-2">
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
    </div>
  );
};

export default DocumentActionButtons;
