import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Document } from '@/types';
import { CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeatureAccess } from '@/hooks/use-permissions';

interface RecentDocumentsTableProps {
  documents: Document[];
  loading: boolean;
}

const RecentDocumentsTable = ({ documents, loading }: RecentDocumentsTableProps) => {
  const navigate = useNavigate();
  const { canApproveDocuments } = useFeatureAccess();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  const handleReviewClick = (docId?: string) => {
    if (docId) {
      navigate(`/documents?docId=${docId}`);
    } else {
      navigate('/documents');
    }
  };
  
  const handleViewAllClick = () => {
    navigate('/documents');
  };

  // Sort documents to show most recent first and limit to 5
  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 5);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
        <CardDescription>Latest uploaded documents awaiting review</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="hidden md:grid md:grid-cols-5 p-3 bg-muted/50 text-xs font-medium">
            <div className="truncate">Document</div>
            <div className="truncate">Type</div>
            <div className="truncate">Upload Date</div>
            <div className="truncate">Status</div>
            <div className="text-right">Action</div>
          </div>
          <div className="divide-y">
            {loading ? (
              Array(4).fill(null).map((_, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-5 p-3 items-center animate-pulse gap-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2 ml-auto"></div>
                </div>
              ))
            ) : recentDocs.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No documents uploaded yet.
              </div>
            ) : (
              recentDocs.map((doc) => (
                <div key={doc.id} className="grid grid-cols-1 md:grid-cols-5 p-3 items-center gap-2">
                  <div className="font-medium truncate pr-2 min-w-0">
                    <span className="md:hidden text-xs text-muted-foreground">Document: </span>
                    {doc.fileName}
                  </div>
                  <div className="truncate min-w-0">
                    <span className="md:hidden text-xs text-muted-foreground">Type: </span>
                    <span className="capitalize">{doc.type}</span>
                  </div>
                  <div className="truncate min-w-0">
                    <span className="md:hidden text-xs text-muted-foreground">Uploaded: </span>
                    {new Date(doc.uploadDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="min-w-0">
                    <span className="md:hidden text-xs text-muted-foreground">Status: </span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        doc.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : doc.status === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-start md:justify-end gap-2 min-w-0">
                    <Button size="sm" variant="outline" onClick={() => handleViewAllClick()}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {doc.status === 'pending' && canApproveDocuments() && (
                      <Button size="sm" onClick={() => handleReviewClick(doc.id)}>
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={handleViewAllClick}>View All Documents</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentDocumentsTable;
