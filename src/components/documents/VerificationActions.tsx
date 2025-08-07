
import React, { useState } from 'react';
import { Document } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';
import { ExtractedData } from './types/documentTypes';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth/AuthContext';
import { createAuditLog } from '@/integrations/supabase/client';

interface VerificationActionsProps {
  document: Document;
  onVerificationComplete: () => void;
}

const VerificationActions: React.FC<VerificationActionsProps> = ({ 
  document, 
  onVerificationComplete 
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleApprove = async () => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          status: 'verified',
          verified_by: user.id,
          verification_date: new Date().toISOString(),
        })
        .eq('id', document.id);

      if (error) throw error;
      
      // Create audit log
      await createAuditLog({
        action: 'Document Approved',
        entity: 'document',
        entity_id: document.id,
        user_id: user.id,
        details: { status: 'verified' }
      });
      
      toast({
        title: "Document approved",
        description: "The document has been verified successfully.",
      });
      
      onVerificationComplete();
    } catch (error) {
      console.error('Error approving document:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve document",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!user) return;
    
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting this document.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a properly typed extracted data object
      const currentExtractedData = document.extracted_data ? 
        (document.extracted_data as unknown as ExtractedData) : {};
      
      const { error } = await supabase
        .from('documents')
        .update({
          status: 'rejected',
          verified_by: user.id,
          verification_date: new Date().toISOString(),
          extracted_data: {
            ...currentExtractedData,
            rejection_reason: rejectionReason
          }
        })
        .eq('id', document.id);

      if (error) throw error;
      
      // Create audit log
      await createAuditLog({
        action: 'Document Rejected',
        entity: 'document',
        entity_id: document.id,
        user_id: user.id,
        details: { 
          status: 'rejected',
          reason: rejectionReason
        }
      });
      
      toast({
        title: "Document rejected",
        description: "The document has been rejected with your comments.",
      });
      
      onVerificationComplete();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject document",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (document.status !== 'pending') {
    return null;
  }

  return (
    <>
      <div>
        <h3 className="text-sm font-medium mb-2">Comments (Required for rejection)</h3>
        <Textarea
          placeholder="Enter verification comments or rejection reason here..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          onClick={handleReject}
          disabled={isSubmitting}
        >
          <X className="mr-1 h-4 w-4" />
          Reject Document
        </Button>
        <Button
          variant="outline"
          className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
          onClick={handleApprove}
          disabled={isSubmitting}
        >
          <Check className="mr-1 h-4 w-4" />
          Approve Document
        </Button>
      </div>
    </>
  );
};

export default VerificationActions;
