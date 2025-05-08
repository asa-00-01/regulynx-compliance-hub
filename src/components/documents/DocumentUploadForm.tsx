
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

interface DocumentUploadFormProps {
  onUploadComplete: () => void;
}

const DocumentUploadForm = ({ onUploadComplete }: DocumentUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('passport');
  const { processImage, isProcessing, progress, error } = useDocumentOCR();
  const { toast } = useToast();

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
    
    // Process document with OCR
    const result = await processImage(file);
    
    // Mock upload to Supabase
    setTimeout(() => {
      // In a real implementation, we would:
      // 1. Upload file to Supabase Storage
      // 2. Create document record with metadata
      // 3. Link extracted data to the document
      
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
      
      // Notify parent component to refresh the documents list
      onUploadComplete();
    }, 1500);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select 
              value={documentType}
              onValueChange={(value) => setDocumentType(value as DocumentType)}
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
              disabled={isProcessing}
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
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
              Error: {error}
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-4">
        <div className="flex justify-end w-full">
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!file || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Upload Document'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentUploadForm;
