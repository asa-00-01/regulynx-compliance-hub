
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, XCircle, Clock, Download, Eye, Upload, RefreshCw } from 'lucide-react';
import { useCompliance } from '@/context/ComplianceContext';
import { format } from 'date-fns';
import DocumentVerificationModal from './DocumentVerificationModal';
import { Document } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { DocumentType } from '@/types/supabase';
import useDocumentOCR from '@/hooks/useDocumentOCR';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

interface DocumentsTabProps {
  userId: string;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ userId }) => {
  const { getRelatedDocuments } = useCompliance();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user, session } = useAuth();
  
  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('passport');
  const [isUploading, setIsUploading] = useState(false);
  const [lastOCRResult, setLastOCRResult] = useState<{ extractedData?: Record<string, string> } | null>(null);
  const { processImage, isProcessing, progress, error } = useDocumentOCR();

  // Load documents on component mount and when userId changes
  useEffect(() => {
    loadDocuments();
  }, [userId]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = getRelatedDocuments(userId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
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
        description: "You must be logged in to upload documents",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Process document with OCR
      console.log('Starting OCR processing for file:', file.name);
      const result = await processImage(file);
      console.log('OCR processing completed:', result);
      
      setLastOCRResult(result);
      
      // Create a unique file path
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const filePath = `organization_customers/${userId}/${documentType}_${timestamp}.${fileExt}`;
      
      // Insert document record
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          organization_customer_id: userId, // Use organization_customer_id instead of user_id
          type: documentType,
          file_name: file.name,
          file_path: filePath,
          status: 'pending',
          extracted_data: result?.extractedData || {}
        })
        .select()
        .single();
      
      if (documentError) {
        throw new Error(`Database error: ${documentError.message}`);
      }

      // Add the new document to the compliance context
      const newDocument: Document = {
        id: documentData.id,
        userId: userId,
        fileName: documentData.file_name,
        type: documentData.type as 'passport' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'other',
        status: documentData.status as 'pending' | 'verified' | 'rejected' | 'information_requested',
        uploadDate: documentData.upload_date,
        verificationDate: documentData.verification_date,
        verifiedBy: documentData.verified_by,
        extractedData: documentData.extracted_data as Record<string, string> || {}
      };

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      
      // Reset form state
      setFile(null);
      setLastOCRResult(null);
      setShowUploadForm(false);
      
      // Reload documents
      await loadDocuments();
      
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
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'information_requested':
        return <Clock className="h-4 w-4 text-yellow-500" />;
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
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      // In a real implementation, this would download the file from storage
      toast({
        title: "Download Started",
        description: `Downloading ${document.fileName}...`
      });
      
      // Simulate download
      setTimeout(() => {
        toast({
          title: "Download Complete",
          description: `${document.fileName} has been downloaded`
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const handleVerificationComplete = (documentId: string, status: 'verified' | 'rejected', reason?: string) => {
    // Update the local documents state
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === documentId 
          ? {
              ...doc,
              status,
              verificationDate: new Date().toISOString(),
              verifiedBy: 'current-user-id', // In real app, get from auth context
              extractedData: {
                ...doc.extractedData,
                ...(status === 'rejected' && reason ? { rejection_reason: reason } : {})
              }
            }
          : doc
      )
    );

    toast({
      title: `Document ${status === 'verified' ? 'Verified' : 'Rejected'}`,
      description: `The document has been ${status} successfully.`
    });
  };

  const handleRequestInfo = (document: Document) => {
    toast({
      title: "Information Requested",
      description: "User has been notified to provide additional information."
    });
    
    // Update document status
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === document.id 
          ? { ...doc, status: 'information_requested' }
          : doc
      )
    );
  };

  const isFormDisabled = isProcessing || isUploading;

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Upload Document</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDocuments}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="flex items-center gap-1"
              >
                <Upload className="h-3 w-3" />
                {showUploadForm ? 'Hide Upload' : 'Upload Document'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showUploadForm && (
          <CardContent>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem value="national_id">ID Card</SelectItem>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="utility_bill">Utility Bill</SelectItem>
                      <SelectItem value="bank_statement">Bank Statement</SelectItem>
                      <SelectItem value="proof_of_income">Proof of Income</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
              
              {lastOCRResult && lastOCRResult.extractedData && Object.keys(lastOCRResult.extractedData).length > 0 && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
                  <strong>OCR Success:</strong> Successfully extracted data from the document!
                  <br />
                  <span className="text-xs">
                    Detected fields: {Object.keys(lastOCRResult.extractedData).filter(key => 
                      lastOCRResult.extractedData[key] && lastOCRResult.extractedData[key].trim() !== ''
                    ).length}
                  </span>
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-md border border-yellow-200">
                  <strong>OCR Warning:</strong> {error}
                  <br />
                  <span className="text-xs">Document will still be uploaded without text extraction.</span>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadForm(false)}
                  disabled={isFormDisabled}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={!file || isFormDisabled}
                >
                  {isUploading ? 'Uploading...' : isProcessing ? 'Processing...' : 'Upload Document'}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Identity Documents ({documents.length})
            {isLoading && <span className="ml-2 text-sm text-muted-foreground">Loading...</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm mb-2">
                No documents have been uploaded yet for this user.
              </p>
              <p className="text-xs text-muted-foreground">
                Documents will appear here once uploaded and processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(document.status)}
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{document.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDocumentType(document.type)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(document.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">Upload Date</p>
                      <p className="font-medium">
                        {format(new Date(document.uploadDate), 'PPP')}
                      </p>
                    </div>
                    {document.verificationDate && (
                      <div>
                        <p className="text-muted-foreground">Verification Date</p>
                        <p className="font-medium">
                          {format(new Date(document.verificationDate), 'PPP')}
                        </p>
                      </div>
                    )}
                  </div>

                  {document.extractedData && (
                    <div className="bg-muted/30 p-3 rounded-md">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Extracted Information</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {document.extractedData.name && (
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <span className="ml-1 font-medium">{document.extractedData.name}</span>
                          </div>
                        )}
                        {document.extractedData.dob && (
                          <div>
                            <span className="text-muted-foreground">DOB:</span>
                            <span className="ml-1 font-medium">{document.extractedData.dob}</span>
                          </div>
                        )}
                        {document.extractedData.idNumber && (
                          <div>
                            <span className="text-muted-foreground">ID Number:</span>
                            <span className="ml-1 font-medium">{document.extractedData.idNumber}</span>
                          </div>
                        )}
                        {document.extractedData.nationality && (
                          <div>
                            <span className="text-muted-foreground">Nationality:</span>
                            <span className="ml-1 font-medium">{document.extractedData.nationality}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {document.status === 'rejected' && document.extractedData?.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                      <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason</p>
                      <p className="text-xs text-red-600">{document.extractedData.rejection_reason}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleDownloadDocument(document)}
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                    
                    {document.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRequestInfo(document)}
                      >
                        Request Info
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      onClick={() => handleViewDocument(document)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      {document.status === 'pending' ? 'Verify' : 'View Details'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentVerificationModal
        document={selectedDocument}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
};

export default DocumentsTab;
