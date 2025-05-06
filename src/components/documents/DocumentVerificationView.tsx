
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { DocumentVerificationViewProps, ExtractedData } from './types/documentTypes';
import DocumentDetails from './DocumentDetails';
import ExtractedInformation from './ExtractedInformation';
import DocumentStatus from './DocumentStatus';
import VerificationActions from './VerificationActions';

const DocumentVerificationView: React.FC<DocumentVerificationViewProps> = ({ 
  document, 
  onVerificationComplete 
}) => {
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
        <DocumentDetails document={document} extractedData={extractedData} />
        <ExtractedInformation extractedData={extractedData} />
        
        {document.status === 'pending' && (
          <VerificationActions 
            document={document} 
            onVerificationComplete={onVerificationComplete} 
          />
        )}

        {(document.status === 'verified' || document.status === 'rejected') && (
          <DocumentStatus document={document} extractedData={extractedData} />
        )}
      </CardContent>
      
      {document.status === 'pending' && (
        <CardFooter className="flex justify-end gap-4">
          {/* Footer is now empty as actions were moved to VerificationActions component */}
        </CardFooter>
      )}
    </Card>
  );
};

export default DocumentVerificationView;
