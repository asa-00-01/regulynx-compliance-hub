
import { useState, useEffect } from 'react';
import { Document, DocumentStatus } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { usePermissions } from '@/hooks/use-permissions';

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
