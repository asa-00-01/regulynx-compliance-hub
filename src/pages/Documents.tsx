
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDocumentsData } from '@/components/documents/useDocumentsData';
import DocumentStats from '@/components/documents/DocumentStats';
import DocumentsGrid from '@/components/documents/DocumentsGrid';
import DocumentVerificationView from '@/components/documents/DocumentVerificationView';
import DocumentDetailsModal from '@/components/documents/DocumentDetailsModal';
import DocumentOverview from '@/components/documents/DocumentOverview';
import AdvancedDocumentFilters from '@/components/documents/AdvancedDocumentFilters';
import DocumentBulkActions from '@/components/documents/DocumentBulkActions';
import DocumentAnalytics from '@/components/documents/DocumentAnalytics';
import { useAdvancedDocumentFilters } from '@/hooks/useAdvancedDocumentFilters';
import { useSearchParams } from 'react-router-dom';
import { useCompliance, ComplianceProvider } from '@/context/ComplianceContext';
import UserCard from '@/components/user/UserCard';
import { BarChart3, Filter, FileText, Download } from 'lucide-react';

const DocumentsContent = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const { getUserById, state } = useCompliance();
  const [userIdFilter, setUserIdFilter] = useState<string | undefined>(undefined);
  const [activeMainTab, setActiveMainTab] = useState('documents');

  // Debug log to see compliance state
  console.log('Documents page - compliance state users:', state.users);

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
    setDocumentForReview,
  } = useDocumentsData();

  // Filter documents by user ID
  const filteredDocuments = userIdFilter
    ? documents.filter(doc => doc.user_id === userIdFilter)
    : documents;

  const {
    filters,
    filteredDocuments: advancedFilteredDocuments,
    activeFiltersCount,
    selectedDocuments,
    updateFilter,
    resetFilters,
    toggleDocumentSelection,
    toggleAllDocuments,
    clearSelection,
    handleBulkAction,
    exportData
  } = useAdvancedDocumentFilters({ documents: filteredDocuments });

  // Set user filter if provided in URL
  useEffect(() => {
    if (userId) {
      setUserIdFilter(userId);
    }
  }, [userId]);

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

  const userDetails = userId ? getUserById(userId) : null;
  const displayDocuments = activeMainTab === 'advanced' ? advancedFilteredDocuments : filteredDocuments;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
        <p className="text-muted-foreground">
          Upload, verify and manage KYC documents with advanced filtering and bulk actions
          {userDetails && ` - Viewing documents for ${userDetails.fullName}`}
        </p>
      </div>

      {/* Show user card if filtering by user */}
      {userId && userDetails && (
        <div className="mb-4 max-w-md">
          <UserCard userId={userId} />
        </div>
      )}

      {/* Document Overview */}
      <DocumentOverview documents={displayDocuments} />

      {/* Statistics Cards */}
      <DocumentStats stats={stats} />

      {/* Main Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Management
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filtering
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">{activeFiltersCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Document Upload and List Grid */}
          <DocumentsGrid
            documents={displayDocuments}
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
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <AdvancedDocumentFilters
            searchTerm={filters.searchTerm}
            setSearchTerm={(term) => updateFilter('searchTerm', term)}
            statusFilter={filters.statusFilter}
            setStatusFilter={(status) => updateFilter('statusFilter', status)}
            typeFilter={filters.typeFilter}
            setTypeFilter={(type) => updateFilter('typeFilter', type)}
            customerFilter={filters.customerFilter}
            setCustomerFilter={(customer) => updateFilter('customerFilter', customer)}
            dateRange={filters.dateRange}
            setDateRange={(range) => updateFilter('dateRange', range)}
            onApplyFilters={() => {}}
            onResetFilters={resetFilters}
            onExportData={exportData}
            activeFiltersCount={activeFiltersCount}
            totalDocuments={filteredDocuments.length}
            filteredDocuments={advancedFilteredDocuments.length}
          />

          {selectedDocuments.length > 0 && (
            <DocumentBulkActions
              selectedDocuments={selectedDocuments}
              documents={advancedFilteredDocuments}
              onClearSelection={clearSelection}
              onBulkAction={handleBulkAction}
            />
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filtered Results</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllDocuments}
                  >
                    {selectedDocuments.length === advancedFilteredDocuments.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <DocumentsGrid
                documents={advancedFilteredDocuments}
                loading={loading}
                activeTab={activeTab}
                onTabChange={(value) => setActiveTab(value as typeof activeTab)}
                onUploadComplete={fetchDocuments}
                onViewDocument={handleViewDocument}
                onReviewDocument={handleReviewDocument}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <DocumentAnalytics documents={displayDocuments} />
        </TabsContent>
      </Tabs>

      {/* Document Details Modal */}
      <DocumentDetailsModal 
        document={selectedDocument} 
        open={showDetailsModal} 
        onOpenChange={setShowDetailsModal} 
      />
    </div>
  );
};

const Documents = () => {
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'support']}>
      <ComplianceProvider>
        <DocumentsContent />
      </ComplianceProvider>
    </DashboardLayout>
  );
};

export default Documents;
