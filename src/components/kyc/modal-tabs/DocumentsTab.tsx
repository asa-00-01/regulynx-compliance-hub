
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { useCompliance } from '@/context/ComplianceContext';
import { format } from 'date-fns';

interface DocumentsTabProps {
  userId: string;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ userId }) => {
  const { getRelatedDocuments } = useCompliance();
  
  // Get documents for this specific user
  const userDocuments = getRelatedDocuments(userId);

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

  if (userDocuments.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Identity Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm mb-2">
                No documents have been uploaded yet for this user.
              </p>
              <p className="text-xs text-muted-foreground">
                Documents will appear here once uploaded and processed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Identity Documents ({userDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userDocuments.map((document) => (
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

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button size="sm">
                    Review Document
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsTab;
