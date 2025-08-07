
import { useState, useEffect } from 'react';
import { Document } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { DocumentFilters } from './types/documentTypes';
import { useAuth } from '@/context/auth/AuthContext';

interface UseDocumentsDataProps {
  initialFilters?: DocumentFilters;
}

const initialFilters: DocumentFilters = {
  searchTerm: '',
  documentType: '',
  status: '',
  dateRange: { from: null, to: null },
  customerId: ''
};

export const useDocumentsData = (props?: UseDocumentsDataProps) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DocumentFilters>(props?.initialFilters || initialFilters);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [documentForReview, setDocumentForReview] = useState<Document | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('documents')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (user && user.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      if (filters.searchTerm) {
        query = query.ilike('file_name', `%${filters.searchTerm}%`);
      }

      if (filters.documentType) {
        query = query.eq('type', filters.documentType);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.customerId) {
        query = query.eq('user_id', filters.customerId);
      }

      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }

      if (filters.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching documents:', error);
      } else {
        setDocuments(data || []);
        setTotalCount(count || 0);
      }
    } catch (error) {
      console.error('Unexpected error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [filters, user]);

  // Calculate stats
  const stats = {
    total: documents.length,
    pending: documents.filter(doc => doc.status === 'pending').length,
    verified: documents.filter(doc => doc.status === 'verified').length,
    rejected: documents.filter(doc => doc.status === 'rejected').length,
  };

  return {
    documents,
    loading,
    filters,
    setFilters,
    totalCount,
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
