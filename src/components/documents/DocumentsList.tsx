
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Document, DocumentStatus } from '@/types/supabase';
import DocumentActionButtons from './DocumentActionButtons';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  
  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={onTabChange}>
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
                  <TableCell className="font-medium">{document.file_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(document.status)}
                      {getStatusBadge(document.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(document.upload_date)}
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
