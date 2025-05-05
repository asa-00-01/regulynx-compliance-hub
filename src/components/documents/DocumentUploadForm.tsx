
import React, { useState } from 'react';
import { DocumentType } from '@/types/supabase';
import { useDocumentOCR } from '@/hooks/useDocumentOCR';
import { FileText, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface DocumentUploadFormProps {
  onUploadComplete: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format YYYY-MM-DD"),
  idNumber: z.string().min(1, "ID number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format YYYY-MM-DD"),
});

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('passport');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { processDocument, isProcessing, ocrProgress, extractedData, setExtractedData } = useDocumentOCR();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      dob: '',
      idNumber: '',
      nationality: '',
      expiryDate: '',
    },
  });
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Start OCR processing
      const result = await processDocument(file, documentType);
      
      if (result) {
        // Populate form with extracted data
        form.setValue('name', result.name || '');
        form.setValue('dob', result.dob || '');
        form.setValue('idNumber', result.idNumber || '');
        form.setValue('nationality', result.nationality || '');
        form.setValue('expiryDate', result.expiryDate || '');
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!selectedFile || !user) return;

    try {
      setUploading(true);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);
      
      // Generate a unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload to Supabase Storage (in a real app)
      // For now we'll just simulate this
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create document record in database
      const { error } = await supabase
        .from('documents')
        .insert({
          file_name: selectedFile.name,
          file_path: filePath,
          type: documentType,
          user_id: user.id,
          status: 'pending',
          extracted_data: {
            name: data.name,
            dob: data.dob,
            idNumber: data.idNumber,
            nationality: data.nationality,
            expiryDate: data.expiryDate
          }
        });
        
      if (error) throw error;
      
      clearInterval(interval);
      setUploadProgress(100);
      
      toast({
        title: "Document uploaded successfully",
        description: "Your document has been uploaded and is pending review.",
      });
      
      // Reset form
      setSelectedFile(null);
      setExtractedData(null);
      form.reset();
      onUploadComplete();
      
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="documentType">Document Type</Label>
        <select
          id="documentType"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          disabled={isProcessing || uploading}
        >
          <option value="passport">Passport</option>
          <option value="id">National ID</option>
          <option value="license">Driver's License</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="document">Upload Document</Label>
        <div className="grid w-full items-center gap-1.5">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="document"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 ${
                (isProcessing || uploading) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
                    <p className="mb-2 text-sm text-center">Processing document...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 mb-2 text-blue-500" />
                    <p className="mb-2 text-sm text-center">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or PDF (MAX. 10MB)
                    </p>
                  </>
                )}
              </div>
              <input
                id="document"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
                disabled={isProcessing || uploading}
              />
            </label>
          </div>

          {isProcessing && (
            <Progress value={ocrProgress} className="h-2 mt-2" />
          )}
          
          {selectedFile && !isProcessing && (
            <div className="text-sm flex items-center gap-2 mt-2">
              <FileText className="h-4 w-4" />
              <span>{selectedFile.name}</span>
            </div>
          )}
        </div>
      </div>
      
      {extractedData && !isProcessing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-md mb-4">
              <h3 className="text-sm font-medium mb-2">OCR Extracted Data</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Please verify and correct the extracted information below.
              </p>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input placeholder="YYYY-MM-DD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Document ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input placeholder="YYYY-MM-DD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading ({uploadProgress}%)
                </>
              ) : (
                'Upload Document'
              )}
            </Button>
            
            {uploading && (
              <Progress value={uploadProgress} className="h-2" />
            )}
          </form>
        </Form>
      )}
    </div>
  );
};

export default DocumentUploadForm;
