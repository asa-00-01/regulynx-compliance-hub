
import React from 'react';
import { Button } from '@/components/ui/button';
import { Document, DocumentStatus } from '@/types/supabase';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/hooks/use-permissions';

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
  const { canApproveDocuments } = usePermissions();
  
  const filteredDocuments = activeTab === 'all' 
    ? documents 
    : documents.filter(doc => doc.status === activeTab);

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <Tabs 
      defaultValue="all" 
      value={activeTab}
      onValueChange={onTabChange}
    >
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="verified">Verified</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-10 w-10 rounded-full border-4 border-t-blue-500 border-b-blue-500 border-r-transparent border-l-transparent animate-spin"></div>
            <p className="text-sm mt-4">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-medium text-lg">No documents found</h3>
            <p className="text-muted-foreground text-sm">
              {activeTab === 'all' 
                ? "No documents have been uploaded yet"
                : `No ${activeTab} documents found`
              }
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="grid grid-cols-4 p-3 bg-muted/50 text-xs font-medium">
              <div>Document</div>
              <div>Type</div>
              <div>Upload Date</div>
              <div className="text-right">Status</div>
            </div>
            <div className="divide-y">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="grid grid-cols-4 p-3 items-center">
                  <div className="font-medium truncate">{doc.file_name}</div>
                  <div className="capitalize">{doc.type}</div>
                  <div>
                    {new Date(doc.upload_date).toLocaleDateString('en-SE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      doc.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : doc.status === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusIcon(doc.status)} {doc.status}
                    </span>
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onViewDocument(doc)}
                      >
                        View
                      </Button>
                      
                      {canApproveDocuments() && doc.status === 'pending' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-blue-600" 
                          onClick={() => onReviewDocument(doc)}
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Tabs>
  );
};

export default DocumentsList;
