
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types';

interface UseDocumentVerificationProps {
  documents: Document[];
  onDocumentsUpdate: (documents: Document[]) => void;
}

export const useDocumentVerification = ({ 
  documents, 
  onDocumentsUpdate 
}: UseDocumentVerificationProps) => {
  const [processingDocuments, setProcessingDocuments] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const setProcessing = (documentId: string, processing: boolean) => {
    setProcessingDocuments(prev => {
      const newSet = new Set(prev);
      if (processing) {
        newSet.add(documentId);
      } else {
        newSet.delete(documentId);
      }
      return newSet;
    });
  };

  const verifyDocument = async (documentId: string, reason?: string) => {
    setProcessing(documentId, true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedDocuments = documents.map(doc => 
        doc.id === documentId 
          ? {
              ...doc,
              status: 'verified' as const,
              verificationDate: new Date().toISOString(),
              verifiedBy: 'current-user', // Should come from auth context
              extractedData: {
                ...doc.extractedData,
                verification_notes: reason || 'Document verified successfully'
              }
            }
          : doc
      );
      
      onDocumentsUpdate(updatedDocuments);
      
      toast({
        title: "Document Verified",
        description: "The document has been successfully verified."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify document.",
        variant: "destructive"
      });
    } finally {
      setProcessing(documentId, false);
    }
  };

  const rejectDocument = async (documentId: string, reason: string) => {
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejecting the document.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(documentId, true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedDocuments = documents.map(doc => 
        doc.id === documentId 
          ? {
              ...doc,
              status: 'rejected' as const,
              verificationDate: new Date().toISOString(),
              verifiedBy: 'current-user', // Should come from auth context
              extractedData: {
                ...doc.extractedData,
                rejection_reason: reason
              }
            }
          : doc
      );
      
      onDocumentsUpdate(updatedDocuments);
      
      toast({
        title: "Document Rejected",
        description: "The document has been rejected with the provided reason."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject document.",
        variant: "destructive"
      });
    } finally {
      setProcessing(documentId, false);
    }
  };

  const requestInformation = async (documentId: string, requestDetails?: string) => {
    setProcessing(documentId, true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedDocuments = documents.map(doc => 
        doc.id === documentId 
          ? {
              ...doc,
              status: 'information_requested' as const,
              extractedData: {
                ...doc.extractedData,
                information_request: requestDetails || 'Additional information requested'
              }
            }
          : doc
      );
      
      onDocumentsUpdate(updatedDocuments);
      
      toast({
        title: "Information Requested",
        description: "User has been notified to provide additional information."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request additional information.",
        variant: "destructive"
      });
    } finally {
      setProcessing(documentId, false);
    }
  };

  const bulkVerifyDocuments = async (documentIds: string[]) => {
    const promises = documentIds.map(id => verifyDocument(id, 'Bulk verification'));
    await Promise.all(promises);
    
    toast({
      title: "Bulk Verification Complete",
      description: `${documentIds.length} documents have been verified.`
    });
  };

  const getDocumentStats = () => {
    const stats = {
      total: documents.length,
      verified: documents.filter(d => d.status === 'verified').length,
      rejected: documents.filter(d => d.status === 'rejected').length,
      pending: documents.filter(d => d.status === 'pending').length,
      informationRequested: documents.filter(d => d.status === 'information_requested').length
    };
    
    return stats;
  };

  return {
    verifyDocument,
    rejectDocument,
    requestInformation,
    bulkVerifyDocuments,
    getDocumentStats,
    isProcessing: (documentId: string) => processingDocuments.has(documentId),
    processingCount: processingDocuments.size
  };
};
