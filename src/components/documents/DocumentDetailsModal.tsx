
import React, { useEffect, useState } from 'react';
import { Document } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentDetailsModalProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentDetailsModal = ({ document, open, onOpenChange }: DocumentDetailsModalProps) => {
  const [verifierName, setVerifierName] = useState<string>('');
  
  useEffect(() => {
    const fetchVerifierName = async () => {
      if (document?.verified_by) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', document.verified_by)
            .single();
          
          if (!error && data) {
            setVerifierName(data.name);
          } else {
            console.warn('Could not fetch verifier name:', error);
            setVerifierName('Unknown User');
          }
        } catch (err) {
          console.error('Error fetching verifier name:', err);
          setVerifierName('Unknown User');
        }
      } else {
        setVerifierName('');
      }
    };
    
    if (open && document) {
      fetchVerifierName();
    }
  }, [document, open]);

  if (!document) return null;
  
  const getStatusIcon = () => {
    switch (document.status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  const getStatusBadgeClass = () => {
    switch (document.status) {
      case 'verified':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Details
          </DialogTitle>
          <DialogDescription>
            Complete information about the document
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center p-6 bg-muted/20 rounded-lg">
            <div className="flex flex-col items-center">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">{document.file_name}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Document Type</p>
              <p className="text-sm font-bold capitalize">{document.type}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <Badge variant="secondary" className={getStatusBadgeClass()}>
                  {document.status}
                </Badge>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upload Date</p>
              <p className="text-sm">
                {format(new Date(document.upload_date), 'PPP p')}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p className="text-sm font-mono">{document.user_id}</p>
            </div>
            
            {document.verification_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verification Date</p>
                <p className="text-sm">
                  {format(new Date(document.verification_date), 'PPP p')}
                </p>
              </div>
            )}
            
            {document.verified_by && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified By</p>
                <p className="text-sm">{verifierName || 'Loading...'}</p>
              </div>
            )}
          </div>
          
          {document.extracted_data && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Extracted Data</p>
              <div className="bg-muted/30 p-3 rounded-md">
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(document.extracted_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            Download Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetailsModal;
