
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
  timestamp: string;
  category: string;
  action: string;
  user_email?: string;
  user_id?: string;
  severity: string;
  details?: Record<string, any>;
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
      // Build query based on filters
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false });

      if (filters.search) {
        query = query.or(`action.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%`);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
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
        
        query = query.gte('timestamp', startDate.toISOString());
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
      // Fetch stats for the last 24 hours
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      const { data: totalEvents } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .gte('timestamp', yesterday.toISOString());

      const { data: securityEvents } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .eq('category', 'security')
        .gte('timestamp', yesterday.toISOString());

      const { data: dataAccessEvents } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .eq('category', 'data_access')
        .gte('timestamp', yesterday.toISOString());

      const { data: failedLogins } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .eq('action', 'login_failed')
        .gte('timestamp', yesterday.toISOString());

      setStats({
        totalEvents: totalEvents?.length || 0,
        securityEvents: securityEvents?.length || 0,
        dataAccessEvents: dataAccessEvents?.length || 0,
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
