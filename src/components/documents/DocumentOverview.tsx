
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Document } from '@/types/supabase';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

interface DocumentOverviewProps {
  documents: Document[];
}

const DocumentOverview: React.FC<DocumentOverviewProps> = ({ documents }) => {
  const totalDocuments = documents.length;
  const verifiedDocuments = documents.filter(doc => doc.status === 'verified').length;
  const pendingDocuments = documents.filter(doc => doc.status === 'pending').length;
  const rejectedDocuments = documents.filter(doc => doc.status === 'rejected').length;
  
  const verificationProgress = totalDocuments > 0 
    ? Math.round((verifiedDocuments / totalDocuments) * 100) 
    : 0;
  
  // Get latest document with reviewer notes
  const latestVerifiedOrRejected = documents
    .filter(doc => doc.status === 'verified' || doc.status === 'rejected')
    .sort((a, b) => new Date(b.verification_date || '').getTime() - new Date(a.verification_date || '').getTime())[0];

  const getReviewerNotes = (document: Document | undefined) => {
    if (!document) return 'No reviews yet';
    
    const extractedData = document.extracted_data as any;
    return extractedData?.rejection_reason || 'No reviewer notes';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Document Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                <span>Total Documents</span>
              </div>
              <span className="font-bold">{totalDocuments}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Verified</span>
                </div>
                <span>{verifiedDocuments}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Pending</span>
                </div>
                <span>{pendingDocuments}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span>Rejected</span>
                </div>
                <span>{rejectedDocuments}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Verification Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={verificationProgress} className="h-2" />
            <div className="text-center text-sm text-muted-foreground">
              {verifiedDocuments} of {totalDocuments} documents verified ({verificationProgress}%)
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Latest Review</CardTitle>
        </CardHeader>
        <CardContent>
          {latestVerifiedOrRejected ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {latestVerifiedOrRejected.status === 'verified' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">
                  {latestVerifiedOrRejected.file_name}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Status: {latestVerifiedOrRejected.status}</p>
                <p>Notes: {getReviewerNotes(latestVerifiedOrRejected)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground p-4">
              No reviews available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentOverview;
