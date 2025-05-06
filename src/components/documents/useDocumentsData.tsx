
import { useState, useEffect } from 'react';
import { Document, DocumentStatus } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { usePermissions } from '@/hooks/use-permissions';
import { ensureMockDocuments } from './mockDocumentData';

export const useDocumentsData = () => {
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
      
      let documentList: Document[] = [];
      
      if (data) {
        documentList = data;
        
        // If no documents found or in development mode, add mock data
        if (documentList.length === 0 || process.env.NODE_ENV === 'development') {
          documentList = ensureMockDocuments(documentList);
        }
        
        setDocuments(documentList);
        
        // Update stats
        setStats({
          pending: documentList.filter(doc => doc.status === 'pending').length,
          verified: documentList.filter(doc => doc.status === 'verified').length,
          rejected: documentList.filter(doc => doc.status === 'rejected').length,
          total: documentList.length
        });
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error fetching documents",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      
      // In case of error, use mock data in development
      if (process.env.NODE_ENV === 'development') {
        const mockDocs = ensureMockDocuments([]);
        setDocuments(mockDocs);
        setStats({
          pending: mockDocs.filter(doc => doc.status === 'pending').length,
          verified: mockDocs.filter(doc => doc.status === 'verified').length,
          rejected: mockDocs.filter(doc => doc.status === 'rejected').length,
          total: mockDocs.length
        });
      }
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

  return {
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
  };
};

export default useDocumentsData;
