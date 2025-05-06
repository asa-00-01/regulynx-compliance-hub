import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Document, DocumentStatus } from '@/types/supabase';
import DocumentActionButtons from './DocumentActionButtons';
import { FileText } from 'lucide-react'; // Added missing import

interface DocumentsListProps {
  documents: Document[];
  loading: boolean;
  activeTab: DocumentStatus | 'all';
  onTabChange: (value: string) => void;
  onViewDocument: (doc: Document) => void;
  onReviewDocument: (doc: Document) => void;
}

const DocumentsList: React.FC<DocumentsListProps> = ({
  documents,
  loading,
  activeTab,
  onTabChange,
  onViewDocument,
  onReviewDocument,
}) => {
  const filteredDocuments = activeTab === 'all'
    ? documents
    : documents.filter(doc => doc.status === activeTab);

  return (
    <Tabs defaultValue={activeTab} className="w-full" onValueChange={onTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="all">All Documents</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="verified">Verified</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Filename</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading documents...
                </TableCell>
              </TableRow>
            ) : filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No documents found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">{document.filename}</TableCell>
                  <TableCell>{document.status}</TableCell>
                  <TableCell>
                    {new Date(document.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DocumentActionButtons
                      document={document}
                      onViewDocument={onViewDocument}
                      onReviewDocument={onReviewDocument}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Tabs>
  );
};

export default DocumentsList;
