
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { DocumentStatus, Document } from '@/types/supabase';
import { FileText, Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/use-permissions';
import DocumentUploadForm from '@/components/documents/DocumentUploadForm';
import DocumentVerificationView from '@/components/documents/DocumentVerificationView';
import DocumentDetailsModal from '@/components/documents/DocumentDetailsModal';
import DashboardMetricsCard from '@/components/dashboard/DashboardMetricsCard';

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DocumentStatus | 'all'>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [documentForReview, setDocumentForReview] = useState<Document | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canApproveDocuments } = usePermissions();

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    total: 0
  });

  // Fetch documents
  const fetchDocuments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // For admin/compliance officers, fetch all documents
      // For regular users, fetch only their own documents
      let query = supabase
        .from('documents')
        .select('*');
      
      if (!canApproveDocuments()) {
        query = query.eq('user_id', user.id);
      }
        
      const { data, error } = await query
        .order('upload_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setDocuments(data);
        
        // Update stats
        setStats({
          pending: data.filter(doc => doc.status === 'pending').length,
          verified: data.filter(doc => doc.status === 'verified').length,
          rejected: data.filter(doc => doc.status === 'rejected').length,
          total: data.length
        });
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error fetching documents",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

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

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDetailsModal(true);
  };

  const handleReviewDocument = (doc: Document) => {
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <DashboardMetricsCard
            title="Total Documents"
            value={stats.total}
            icon={FileText}
          />
          <DashboardMetricsCard
            title="Pending Review"
            value={stats.pending}
            icon={Clock}
            valueColor="text-yellow-600"
          />
          <DashboardMetricsCard
            title="Verified Documents"
            value={stats.verified}
            icon={CheckCircle}
            valueColor="text-green-600"
          />
          <DashboardMetricsCard
            title="Rejected Documents"
            value={stats.rejected}
            icon={AlertCircle}
            valueColor="text-red-600"
          />
        </div>

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
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUploadForm onUploadComplete={fetchDocuments} />
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
              <Tabs 
                defaultValue="all" 
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as DocumentStatus | 'all')}
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
                                  onClick={() => handleViewDocument(doc)}
                                >
                                  View
                                </Button>
                                
                                {canApproveDocuments() && doc.status === 'pending' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-blue-600" 
                                    onClick={() => handleReviewDocument(doc)}
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
            </CardContent>
          </Card>
        </div>

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
