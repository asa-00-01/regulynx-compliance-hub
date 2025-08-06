import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentType } from '@/types/supabase';
import useDocumentOCR from '@/hooks/useDocumentOCR';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CustomerSelector from './CustomerSelector';
import { useFeatureAccess } from '@/hooks/use-permissions';

interface DocumentUploadFormProps {
  onUploadComplete: () => void;
  preSelectedCustomerId?: string;
}

const DocumentUploadForm = ({ onUploadComplete, preSelectedCustomerId }: DocumentUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('passport');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preSelectedCustomerId || '');
  const [isUploading, setIsUploading] = useState(false);
  const { processImage, isProcessing, progress, error } = useDocumentOCR();
  const { toast } = useToast();
  const { user, session } = useAuth();
  const { canApproveDocuments } = useFeatureAccess();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    if (!user || !session) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload documents. Please sign in again.",
        variant: "destructive"
      });
      return;
    }

    // For compliance officers, require customer selection
    if (canApproveDocuments() && !selectedCustomerId) {
      toast({
        title: "Error",
        description: "Please select a customer for this document",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Process document with OCR (this will handle errors gracefully now)
      console.log('Starting OCR processing for file:', file.name, 'type:', file.type);
      const result = await processImage(file);
      console.log('OCR processing completed:', result);
      
      // Create a unique file path
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const documentUserId = canApproveDocuments() ? selectedCustomerId : user.id;
      const filePath = `${documentUserId}/${documentType}_${timestamp}.${fileExt}`;
      
      console.log('Inserting document record with path:', filePath);
      console.log('Document user ID:', documentUserId);
      console.log('Current authenticated user:', user.id);
      console.log('Session exists:', !!session);
      
      // Insert document record
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          user_id: documentUserId,
          type: documentType,
          file_name: file.name,
          file_path: filePath,
          status: 'pending',
          extracted_data: result?.extractedData || {}
        })
        .select()
        .single();
      
      if (documentError) {
        console.error('Database error:', documentError);
        
        // Provide more specific error messages based on the error type
        if (documentError.message.includes('row-level security')) {
          throw new Error('Permission denied: You do not have permission to upload documents. Please check your authentication status and try signing in again.');
        } else if (documentError.code === '42501') {
          throw new Error('Permission denied: Please ensure you are properly authenticated and try again.');
        } else {
          throw new Error(`Database error: ${documentError.message}`);
        }
      }

      console.log('Document record created successfully:', documentData);

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      
      // Display extracted data in the toast if available
      if (result && result.extractedData && result.extractedData.name) {
        toast({
          title: "Document Processed",
          description: `Detected name: ${result.extractedData.name}`,
        });
      }
      
      // Reset form state
      setFile(null);
      if (!preSelectedCustomerId) {
        setSelectedCustomerId('');
      }
      
      // Notify parent component to refresh the documents list
      onUploadComplete();
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred while uploading the document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isFormDisabled = isProcessing || isUploading;

  // Show authentication warning if not properly authenticated
  if (!user || !session) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800 text-sm">
          Please sign in to upload documents. You will be redirected to the login page.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer Selection - only show for compliance officers */}
      {canApproveDocuments() && !preSelectedCustomerId && (
        <CustomerSelector
          selectedCustomerId={selectedCustomerId}
          onCustomerSelect={setSelectedCustomerId}
          label="Customer"
        />
      )}

      <div className="space-y-2">
        <Label htmlFor="documentType">Document Type</Label>
        <Select 
          value={documentType}
          onValueChange={(value) => setDocumentType(value as DocumentType)}
          disabled={isFormDisabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="passport">Passport</SelectItem>
            <SelectItem value="id">ID Card</SelectItem>
            <SelectItem value="license">Driver's License</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="file">Upload Document</Label>
        <Input 
          id="file" 
          type="file" 
          accept="image/png, image/jpeg, application/pdf"
          onChange={handleFileChange} 
          disabled={isFormDisabled}
        />
        {file && (
          <div className="text-xs text-muted-foreground">
            {file.name} ({Math.round(file.size / 1024)} KB)
          </div>
        )}
      </div>
      
      {isProcessing && (
        <div className="space-y-2">
          <Label>Processing document...</Label>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {progress}% complete - OCR is analyzing the document
          </p>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-md border border-yellow-200">
          <strong>OCR Warning:</strong> {error}
          <br />
          <span className="text-xs">Document will still be uploaded without text extraction.</span>
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <Button 
          type="submit"
          disabled={!file || isFormDisabled}
        >
          {isUploading ? 'Uploading...' : isProcessing ? 'Processing...' : 'Upload Document'}
        </Button>
      </div>
    </form>
  );
};

export default DocumentUploadForm;
