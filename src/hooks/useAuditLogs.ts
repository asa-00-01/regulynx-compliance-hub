
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { config } from '@/config/environment';

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
  details: Record<string, unknown> | null;
  created_at: string;
  ip_address?: string;
}

interface AuditStats {
  totalEvents: number;
  securityEvents: number;
  dataAccessEvents: number;
  failedLogins: number;
}

// Mock audit log data
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'login_success',
    entity: 'authentication',
    entity_id: null,
    user_id: 'user-123',
    details: {
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      session_id: 'session-456'
    },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    ip_address: '192.168.1.100'
  },
  {
    id: '2',
    action: 'login_failed',
    entity: 'authentication',
    entity_id: null,
    user_id: null,
    details: {
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      reason: 'Invalid credentials'
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    ip_address: '192.168.1.101'
  },
  {
    id: '3',
    action: 'data_access',
    entity: 'data_access',
    entity_id: 'case-789',
    user_id: 'user-123',
    details: {
      resource: 'compliance_cases',
      operation: 'read',
      case_id: 'case-789'
    },
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    ip_address: '192.168.1.100'
  },
  {
    id: '4',
    action: 'permission_denied',
    entity: 'authorization',
    entity_id: 'admin-panel',
    user_id: 'user-456',
    details: {
      resource: 'admin_panel',
      required_role: 'admin',
      user_role: 'user'
    },
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    ip_address: '192.168.1.102'
  },
  {
    id: '5',
    action: 'sar_created',
    entity: 'user_action',
    entity_id: 'sar-001',
    user_id: 'user-123',
    details: {
      sar_id: 'sar-001',
      case_id: 'case-789',
      risk_score: 85
    },
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    ip_address: '192.168.1.100'
  }
];

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

  // Memoize filters to prevent infinite re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters.search,
    filters.category,
    filters.severity,
    filters.dateRange,
    filters.page,
    filters.limit
  ]);

  useEffect(() => {
    let isMounted = true;

    const fetchAuditLogs = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      try {
        if (config.features.useMockData) {
          console.log('🎭 Using mock audit logs data');
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          let filteredLogs = [...mockAuditLogs];
          
          // Apply search filter
          if (memoizedFilters.search) {
            filteredLogs = filteredLogs.filter(log => 
              log.action.toLowerCase().includes(memoizedFilters.search!.toLowerCase()) ||
              log.entity.toLowerCase().includes(memoizedFilters.search!.toLowerCase())
            );
          }
          
          // Apply category filter
          if (memoizedFilters.category) {
            filteredLogs = filteredLogs.filter(log => log.entity === memoizedFilters.category);
          }
          
          // Apply date range filter
          if (memoizedFilters.dateRange) {
            const now = new Date();
            const startDate = new Date();
            
            switch (memoizedFilters.dateRange) {
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
            
            filteredLogs = filteredLogs.filter(log => new Date(log.created_at) >= startDate);
          }
          
          // Apply pagination
          const totalCount = filteredLogs.length;
          if (memoizedFilters.page && memoizedFilters.limit) {
            const from = (memoizedFilters.page - 1) * memoizedFilters.limit;
            const to = from + memoizedFilters.limit;
            filteredLogs = filteredLogs.slice(from, to);
          }
          
          if (isMounted) {
            setLogs(filteredLogs);
            setTotalCount(totalCount);
          }
          return;
        }

        // Real Supabase query
        let query = supabase
          .from('audit_logs')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (memoizedFilters.search) {
          query = query.or(`action.ilike.%${memoizedFilters.search}%,entity.ilike.%${memoizedFilters.search}%`);
        }

        if (memoizedFilters.dateRange) {
          const now = new Date();
          const startDate = new Date();
          
          switch (memoizedFilters.dateRange) {
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

        if (memoizedFilters.page && memoizedFilters.limit) {
          const from = (memoizedFilters.page - 1) * memoizedFilters.limit;
          const to = from + memoizedFilters.limit - 1;
          query = query.range(from, to);
        }

        const { data, error, count } = await query;

        if (error) {
          console.error('Error fetching audit logs:', error);
          return;
        }

        if (isMounted) {
          // Type assertion to handle Supabase Json type
          setLogs((data as AuditLog[]) || []);
          setTotalCount(count || 0);
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchStats = async () => {
      if (!isMounted) return;
      
      try {
        if (config.features.useMockData) {
          console.log('🎭 Using mock audit stats data');
          
          // Calculate stats from mock data
          const yesterday = new Date();
          yesterday.setHours(yesterday.getHours() - 24);
          
          const recentLogs = mockAuditLogs.filter(log => new Date(log.created_at) >= yesterday);
          
          const totalEvents = recentLogs.length;
          const securityEvents = recentLogs.filter(log => log.entity === 'authentication' || log.entity === 'authorization').length;
          const dataAccessEvents = recentLogs.filter(log => log.entity === 'data_access').length;
          const failedLogins = recentLogs.filter(log => log.action === 'login_failed').length;
          
          if (isMounted) {
            setStats({
              totalEvents,
              securityEvents,
              dataAccessEvents,
              failedLogins
            });
          }
          return;
        }

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

        if (isMounted) {
          setStats({
            totalEvents: totalEvents?.length || 0,
            securityEvents: authEvents?.length || 0,
            dataAccessEvents: dataEvents?.length || 0,
            failedLogins: failedLogins?.length || 0
          });
        }
      } catch (error) {
        console.error('Error fetching audit stats:', error);
      }
    };

    fetchAuditLogs();
    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [memoizedFilters]);

  return {
    logs,
    loading,
    stats,
    totalCount
  };
};
