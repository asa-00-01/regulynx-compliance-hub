
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentStatus } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import { useFeatureAccess } from '@/hooks/use-permissions';

export const useDocumentsData = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DocumentStatus | 'all'>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [documentForReview, setDocumentForReview] = useState<Document | null>(null);
  const { user, session } = useAuth();
  const { canApproveDocuments } = useFeatureAccess();

  const fetchDocuments = async () => {
    if (!user || !session) {
      console.log('No authenticated user or session found');
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      console.log('Fetching documents for user:', user.id);
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
    if (user && session) {
      fetchDocuments();
    } else {
      setDocuments([]);
      setLoading(false);
    }
  }, [user, session]);

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
