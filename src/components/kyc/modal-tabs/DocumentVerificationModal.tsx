
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types';

interface DocumentVerificationModalProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerificationComplete: (documentId: string, status: 'verified' | 'rejected', reason?: string) => void;
}

const DocumentVerificationModal: React.FC<DocumentVerificationModalProps> = ({
  document,
  open,
  onOpenChange,
  onVerificationComplete
}) => {
  const [verificationReason, setVerificationReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  if (!document) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'information_requested':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'information_requested':
        return <Badge className="bg-yellow-100 text-yellow-800">Info Requested</Badge>;
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  const handleVerify = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onVerificationComplete(document.id, 'verified', verificationReason || 'Document verified successfully');
      
      toast({
        title: "Document Verified",
        description: "The document has been successfully verified."
      });
      
      onOpenChange(false);
      setVerificationReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify document.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!verificationReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejecting the document.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onVerificationComplete(document.id, 'rejected', verificationReason);
      
      toast({
        title: "Document Rejected",
        description: "The document has been rejected."
      });
      
      onOpenChange(false);
      setVerificationReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject document.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Document download will begin shortly."
    });
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Preview Area */}
          <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg border-2 border-dashed">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium mb-2">{document.fileName}</p>
              <p className="text-xs text-muted-foreground mb-4">
                {formatDocumentType(document.type)}
              </p>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Eye className="h-4 w-4 mr-2" />
                View Document
              </Button>
            </div>
          </div>

          {/* Document Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Document Type</Label>
              <p className="text-sm font-medium">{formatDocumentType(document.type)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(document.status)}
                {getStatusBadge(document.status)}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Upload Date</Label>
              <p className="text-sm">{format(new Date(document.uploadDate), 'PPP')}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">File Name</Label>
              <p className="text-sm truncate">{document.fileName}</p>
            </div>
          </div>

          {/* Extracted Information */}
          {document.extractedData && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                Extracted Information
              </Label>
              <div className="bg-muted/30 p-4 rounded-md space-y-2">
                {document.extractedData.name && (
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Name:</span>
                    <span className="text-xs font-medium">{document.extractedData.name}</span>
                  </div>
                )}
                {document.extractedData.dob && (
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Date of Birth:</span>
                    <span className="text-xs font-medium">{document.extractedData.dob}</span>
                  </div>
                )}
                {document.extractedData.idNumber && (
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">ID Number:</span>
                    <span className="text-xs font-medium">{document.extractedData.idNumber}</span>
                  </div>
                )}
                {document.extractedData.nationality && (
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Nationality:</span>
                    <span className="text-xs font-medium">{document.extractedData.nationality}</span>
                  </div>
                )}
                {document.extractedData.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Expiry Date:</span>
                    <span className="text-xs font-medium">{document.extractedData.expiryDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verification Notes */}
          {document.status === 'pending' && (
            <div>
              <Label htmlFor="verification-reason" className="text-sm font-medium">
                Verification Notes
              </Label>
              <Textarea
                id="verification-reason"
                placeholder="Add verification notes or rejection reason..."
                value={verificationReason}
                onChange={(e) => setVerificationReason(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          )}

          {/* Previous Verification Info */}
          {document.status !== 'pending' && document.verificationDate && (
            <div className="p-4 bg-muted/30 rounded-md">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                Verification History
              </Label>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Verified by:</span> {document.verifiedBy || 'System'}
                </p>
                <p>
                  <span className="font-medium">Date:</span> {format(new Date(document.verificationDate), 'PPP')}
                </p>
                {document.extractedData?.rejection_reason && (
                  <p>
                    <span className="font-medium">Reason:</span> {document.extractedData.rejection_reason}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          
          {document.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleVerify}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentVerificationModal;
