
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuditLogFilters {
  search?: string;
  category?: string;
  severity?: string;
  dateRange?: string;
  page?: number;
  limit?: number;
}

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  user_id: string | null;
  details: any;
  created_at: string;
}

interface AuditStats {
  totalEvents: number;
  securityEvents: number;
  dataAccessEvents: number;
  failedLogins: number;
}

export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<AuditStats>({
    totalEvents: 0,
    securityEvents: 0,
    dataAccessEvents: 0,
    failedLogins: 0
  });

  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
  }, [filters]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`action.ilike.%${filters.search}%,entity.ilike.%${filters.search}%`);
      }

      if (filters.dateRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (filters.dateRange) {
          case 'last_24_hours':
            startDate.setHours(now.getHours() - 24);
            break;
          case 'last_7_days':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'last_30_days':
            startDate.setDate(now.getDate() - 30);
            break;
          case 'last_90_days':
            startDate.setDate(now.getDate() - 90);
            break;
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        return;
      }

      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      const { data: totalEvents } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .gte('created_at', yesterday.toISOString());

      const { data: authEvents } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .eq('entity', 'authentication')
        .gte('created_at', yesterday.toISOString());

      const { data: dataEvents } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .eq('entity', 'data_access')
        .gte('created_at', yesterday.toISOString());

      const { data: failedLogins } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .eq('action', 'login_failed')
        .gte('created_at', yesterday.toISOString());

      setStats({
        totalEvents: totalEvents?.length || 0,
        securityEvents: authEvents?.length || 0,
        dataAccessEvents: dataEvents?.length || 0,
        failedLogins: failedLogins?.length || 0
      });
    } catch (error) {
      console.error('Error fetching audit stats:', error);
    }
  };

  return {
    logs,
    loading,
    stats,
    totalCount
  };
};
