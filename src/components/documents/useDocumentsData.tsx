
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentStatus } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/use-permissions';

export const useDocumentsData = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DocumentStatus | 'all'>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [documentForReview, setDocumentForReview] = useState<Document | null>(null);
  const { user, session, isAuthenticated } = useAuth();
  const { canApproveDocuments } = usePermissions();

  const fetchDocuments = async () => {
    if (!isAuthenticated || !session) {
      console.log('User not authenticated, skipping document fetch');
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      console.log('Fetching documents for authenticated user:', user?.email);
      console.log('User can approve documents:', canApproveDocuments());
      
      // With RLS policies in place, the query will automatically filter documents
      // based on the user's permissions:
      // - Regular users will only see their own documents
      // - Compliance officers and admins will see all documents
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} documents`);
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && session) {
      fetchDocuments();
    } else {
      setDocuments([]);
      setLoading(false);
    }
  }, [isAuthenticated, session, user]);

  // Calculate stats based on the fetched documents
  const stats = {
    total: documents.length,
    pending: documents.filter(doc => doc.status === 'pending').length,
    verified: documents.filter(doc => doc.status === 'verified').length,
    rejected: documents.filter(doc => doc.status === 'rejected').length,
  };

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
    setDocumentForReview,
  };
};
