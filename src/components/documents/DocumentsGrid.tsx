
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import DocumentUploadForm from '@/components/documents/DocumentUploadForm';
import DocumentsList from '@/components/documents/DocumentsList';
import { Document, DocumentStatus } from '@/types/supabase';
import { useSearchParams } from 'react-router-dom';

interface DocumentsGridProps {
  documents: Document[];
  loading: boolean;
  activeTab: DocumentStatus | 'all';
  onTabChange: (value: string) => void;
  onUploadComplete: () => void;
  onViewDocument: (doc: Document) => void;
  onReviewDocument: (doc: Document) => void;
  selectedDocuments?: string[];
  onDocumentSelect?: (documentId: string) => void;
}

const DocumentsGrid: React.FC<DocumentsGridProps> = ({
  documents,
  loading,
  activeTab,
  onTabChange,
  onUploadComplete,
  onViewDocument,
  onReviewDocument,
  selectedDocuments = [],
  onDocumentSelect
}) => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Document Upload Card */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </CardTitle>
          <CardDescription>
            Upload a new document for KYC verification
            {userId && " for the selected customer"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUploadForm 
            onUploadComplete={onUploadComplete}
            preSelectedCustomerId={userId || undefined}
          />
        </CardContent>
      </Card>

      {/* Document List Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Document List</CardTitle>
          <CardDescription>
            View and manage uploaded documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentsList
            documents={documents}
            loading={loading}
            activeTab={activeTab}
            onTabChange={onTabChange}
            onViewDocument={onViewDocument}
            onReviewDocument={onReviewDocument}
            selectedDocuments={selectedDocuments}
            onDocumentSelect={onDocumentSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsGrid;
