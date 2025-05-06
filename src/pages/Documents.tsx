
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useDocumentsData } from '@/components/documents/useDocumentsData';
import DocumentStats from '@/components/documents/DocumentStats';
import DocumentsGrid from '@/components/documents/DocumentsGrid';
import DocumentVerificationView from '@/components/documents/DocumentVerificationView';
import DocumentDetailsModal from '@/components/documents/DocumentDetailsModal';

const Documents = () => {
  const {
    documents,
    loading,
    activeTab,
    setActiveTab,
    stats,
    fetchDocuments,
    selectedDocument,
    setSelectedDocument,
    showDetailsModal,
    setShowDetailsModal,
    documentForReview,
    setDocumentForReview
  } = useDocumentsData();

  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowDetailsModal(true);
  };

  const handleReviewDocument = (doc: any) => {
    setDocumentForReview(doc);
  };

  const handleVerificationComplete = () => {
    setDocumentForReview(null);
    fetchDocuments();
  };

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'support']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground">
            Upload, verify and manage KYC documents
          </p>
        </div>

        {/* Statistics Cards */}
        <DocumentStats stats={stats} />

        {/* Document Upload and List Grid */}
        <DocumentsGrid
          documents={documents}
          loading={loading}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as typeof activeTab)}
          onUploadComplete={fetchDocuments}
          onViewDocument={handleViewDocument}
          onReviewDocument={handleReviewDocument}
        />

        {/* Document Review Section */}
        {documentForReview && (
          <Card>
            <CardContent className="pt-6">
              <DocumentVerificationView 
                document={documentForReview} 
                onVerificationComplete={handleVerificationComplete} 
              />
            </CardContent>
          </Card>
        )}

        {/* Document Details Modal */}
        <DocumentDetailsModal 
          document={selectedDocument} 
          open={showDetailsModal} 
          onOpenChange={setShowDetailsModal} 
        />
      </div>
    </DashboardLayout>
  );
};

export default Documents;
