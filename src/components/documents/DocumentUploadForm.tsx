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
import { useTranslation } from 'react-i18next';

interface DocumentUploadFormProps {
  onUploadComplete: () => void;
  preSelectedCustomerId?: string;
}

const DocumentUploadForm = ({ onUploadComplete, preSelectedCustomerId }: DocumentUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('passport');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preSelectedCustomerId || '');
  const [isUploading, setIsUploading] = useState(false);
  const [lastOCRResult, setLastOCRResult] = useState<{ extractedData?: Record<string, string> } | null>(null);
  const { processImage, isProcessing, progress, error } = useDocumentOCR();
  const { toast } = useToast();
  const { user, session } = useAuth();
  const { canApproveDocuments } = useFeatureAccess();
  const { t } = useTranslation();

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
      
      // Store the result for display
      setLastOCRResult(result);
      
      // Create a unique file path
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const documentUserId = canApproveDocuments() ? selectedCustomerId : user.id;
      const filePath = `organization_customers/${documentUserId}/${documentType}_${timestamp}.${fileExt}`;
      
      console.log('Inserting document record with path:', filePath);
      console.log('Document organization customer ID:', documentUserId);
      console.log('Current authenticated user:', user.id);
      console.log('Session exists:', !!session);
      
      // Insert document record
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          organization_customer_id: documentUserId, // Use organization_customer_id instead of user_id
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
      if (result && result.extractedData) {
        const extractedFields = Object.keys(result.extractedData).filter(key => 
          result.extractedData[key] && result.extractedData[key].trim() !== ''
        );
        
        if (extractedFields.length > 0) {
          toast({
            title: "OCR Processing Complete",
            description: t('documents.ocrProcessingCompleteDescription', { count: extractedFields.length }),
          });
        }
      }
      
      // Reset form state
      setFile(null);
      setLastOCRResult(null);
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
          {t('documents.authenticationWarningMessage')}
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
        <Label htmlFor="documentType">{t('documents.documentType')}</Label>
        <Select 
          value={documentType}
          onValueChange={(value) => setDocumentType(value as DocumentType)}
          disabled={isFormDisabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('documents.selectDocumentType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="passport">{t('documents.passport')}</SelectItem>
            <SelectItem value="national_id">ID Card</SelectItem>
            <SelectItem value="drivers_license">{t('documents.driversLicense')}</SelectItem>
            <SelectItem value="utility_bill">{t('documents.utilityBill')}</SelectItem>
            <SelectItem value="bank_statement">{t('documents.bankStatement')}</SelectItem>
            <SelectItem value="proof_of_income">Proof of Income</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="file">{t('documents.uploadDocument')}</Label>
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
          <Label>{t('documents.processingDocument')}</Label>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {t('documents.ocrProgressMessage', { progress: progress })}
          </p>
        </div>
      )}
      
      {lastOCRResult && lastOCRResult.extractedData && Object.keys(lastOCRResult.extractedData).length > 0 && (
        <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
          <strong>{t('documents.ocrSuccessTitle')}:</strong> {t('documents.ocrSuccessDescription')}
          <br />
          <span className="text-xs">
            {t('documents.detectedFieldsMessage', { count: Object.keys(lastOCRResult.extractedData).filter(key => 
              lastOCRResult.extractedData[key] && lastOCRResult.extractedData[key].trim() !== ''
            ).length })}
          </span>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-md border border-yellow-200">
          <strong>{t('documents.ocrWarningTitle')}:</strong> {error}
          <br />
          <span className="text-xs">{t('documents.documentWillStillBeUploadedMessage')}</span>
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <Button 
          type="submit"
          disabled={!file || isFormDisabled}
        >
          {isUploading ? t('documents.uploadingButtonText') : isProcessing ? t('documents.processingButtonText') : t('documents.uploadDocumentButtonText')}
        </Button>
      </div>
    </form>
  );
};

export default DocumentUploadForm;
