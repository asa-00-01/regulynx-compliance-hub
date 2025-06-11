
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Document, DocumentStatus } from '@/types/supabase';
import DocumentActionButtons from './DocumentActionButtons';
import { CheckCircle, Clock, XCircle, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCompliance } from '@/context/ComplianceContext';
import { usePermissions } from '@/hooks/use-permissions';

interface DocumentsListProps {
  documents: Document[];
  loading: boolean;
  activeTab: DocumentStatus | 'all';
  onTabChange: (value: string) => void;
  onViewDocument: (doc: Document) => void;
  onReviewDocument: (doc: Document) => void;
  selectedDocuments?: string[];
  onDocumentSelect?: (documentId: string) => void;
}

const DocumentsList: React.FC<DocumentsListProps> = ({
  documents,
  loading,
  activeTab,
  onTabChange,
  onViewDocument,
  onReviewDocument,
  selectedDocuments = [],
  onDocumentSelect
}) => {
  const { state } = useCompliance();
  const { canApproveDocuments } = usePermissions();
  
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

  const getCustomerName = (userId: string) => {
    const customer = state.users.find(u => u.id === userId);
    return customer?.fullName || 'Unknown Customer';
  };

  const showSelection = canApproveDocuments() && onDocumentSelect;

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
              {showSelection && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                    indeterminate={selectedDocuments.length > 0 && selectedDocuments.length < filteredDocuments.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        filteredDocuments.forEach(doc => onDocumentSelect(doc.id));
                      } else {
                        selectedDocuments.forEach(id => onDocumentSelect(id));
                      }
                    }}
                  />
                </TableHead>
              )}
              <TableHead className="w-[200px]">Filename</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={showSelection ? 6 : 5} className="text-center">
                  Loading documents...
                </TableCell>
              </TableRow>
            ) : filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showSelection ? 6 : 5} className="text-center">
                  No documents found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((document) => (
                <TableRow key={document.id}>
                  {showSelection && (
                    <TableCell>
                      <Checkbox
                        checked={selectedDocuments.includes(document.id)}
                        onCheckedChange={() => onDocumentSelect(document.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{document.file_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{getCustomerName(document.user_id)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(document.status as DocumentStatus)}
                      {getStatusBadge(document.status as DocumentStatus)}
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
