
import React, { useState } from 'react';
import { Document } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { createAuditLog } from '@/integrations/supabase/client';

interface DocumentVerificationViewProps {
  document: Document;
  onVerificationComplete: () => void;
}

// Define a type for the extracted data to ensure type safety
interface ExtractedData {
  name?: string;
  dob?: string;
  idNumber?: string;
  nationality?: string;
  expiryDate?: string;
  rejection_reason?: string;
}

const DocumentVerificationView: React.FC<DocumentVerificationViewProps> = ({ 
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

  // Cast extracted data to the proper type
  const extractedData = document.extracted_data ? 
    (document.extracted_data as unknown as ExtractedData) : {};

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Verification
        </CardTitle>
        <CardDescription>
          Review the document and extracted information before verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Document Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Type:</p>
              <p className="font-medium capitalize">{document.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Uploaded:</p>
              <p className="font-medium">
                {format(new Date(document.upload_date), 'PPP')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">File Name:</p>
              <p className="font-medium truncate">{document.file_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">User ID:</p>
              <p className="font-medium truncate">{document.user_id}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium mb-3">Extracted Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="text-sm font-medium">{extractedData.name || 'Not available'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <p className="text-sm font-medium">{extractedData.dob || 'Not available'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Document Number</p>
              <p className="text-sm font-medium">{extractedData.idNumber || 'Not available'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nationality</p>
              <p className="text-sm font-medium">{extractedData.nationality || 'Not available'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expiry Date</p>
              <p className="text-sm font-medium">{extractedData.expiryDate || 'Not available'}</p>
            </div>
          </div>
        </div>

        {document.status === 'pending' && (
          <div>
            <h3 className="text-sm font-medium mb-2">Comments (Required for rejection)</h3>
            <Textarea
              placeholder="Enter verification comments or rejection reason here..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        )}

        {document.status === 'verified' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="h-5 w-5" />
              <p className="font-medium">Document Verified</p>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Verified by: {document.verified_by || 'System'} on {
                document.verification_date ? format(new Date(document.verification_date), 'PPP') : 'N/A'
              }
            </p>
          </div>
        )}

        {document.status === 'rejected' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-700">
              <X className="h-5 w-5" />
              <p className="font-medium">Document Rejected</p>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Rejected by: {document.verified_by || 'System'} on {
                document.verification_date ? format(new Date(document.verification_date), 'PPP') : 'N/A'
              }
            </p>
            {extractedData.rejection_reason && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Reason:</p>
                <p className="text-sm">{extractedData.rejection_reason}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {document.status === 'pending' && (
        <CardFooter className="flex justify-end gap-4">
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
        </CardFooter>
      )}
    </Card>
  );
};

export default DocumentVerificationView;
