
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/supabase';

interface DocumentStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

export const useDocuments = (userId?: string | null) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0
  });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .order('upload_date', { ascending: false });

      // If userId is provided, filter by that user
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      setDocuments(data || []);
      
      // Calculate stats
      const docs = data || [];
      setStats({
        total: docs.length,
        pending: docs.filter(doc => doc.status === 'pending').length,
        verified: docs.filter(doc => doc.status === 'verified').length,
        rejected: docs.filter(doc => doc.status === 'rejected').length,
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [userId]);

  const refetch = () => {
    fetchDocuments();
  };

  return {
    documents,
    loading,
    stats,
    refetch
  };
};
