import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UsageData {
  apiCalls: number;
  apiCallsChange: number;
  documentsProcessed: number;
  documentsChange: number;
  activeUsers: number;
  lastActiveTime: string;
  dataStorage: string;
}

export interface QuotaData {
  metric: string;
  used: number;
  limit: number;
}

export interface TrendsData {
  usage: Array<{
    date: string;
    apiCalls: number;
    documents: number;
  }>;
  features: Array<{
    feature: string;
    usage: number;
  }>;
  apiEndpoints: Array<{
    endpoint: string;
    calls: number;
    errors: number;
  }>;
  performance: Array<{
    time: string;
    avgResponseTime: number;
  }>;
  errors: Array<{
    date: string;
    errorRate: number;
  }>;
}

export const useUsageAnalytics = () => {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [quotaData, setQuotaData] = useState<QuotaData[]>([]);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const refreshData = useCallback(async (period: '7d' | '30d' | '90d') => {
    setLoading(true);
    try {
      // Fetch usage metrics from the database
      const { data: metrics, error: metricsError } = await supabase
        .from('usage_metrics')
        .select('*')
        .gte('created_at', new Date(Date.now() - getPeriodInMs(period)).toISOString());

      if (metricsError) throw metricsError;

      // Process metrics data
      const processedUsage = processUsageMetrics(metrics || []);
      setUsageData(processedUsage);

      // Generate quota data (mock data for demo)
      const quotas = generateQuotaData(processedUsage);
      setQuotaData(quotas);

      // Generate trends data
      const trends = generateTrendsData(metrics || [], period);
      setTrendsData(trends);

    } catch (error) {
      console.error('Error fetching usage analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load usage analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const exportUsageReport = useCallback(async (period: '7d' | '30d' | '90d') => {
    try {
      const reportData = {
        period,
        generatedAt: new Date().toISOString(),
        usage: usageData,
        quotas: quotaData,
        trends: trendsData,
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usage-report-${period}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Report Exported',
        description: 'Usage report has been downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export usage report',
        variant: 'destructive',
      });
    }
  }, [usageData, quotaData, trendsData, toast]);

  return {
    usageData,
    quotaData,
    trendsData,
    loading,
    refreshData,
    exportUsageReport,
  };
};

function getPeriodInMs(period: '7d' | '30d' | '90d'): number {
  switch (period) {
    case '7d': return 7 * 24 * 60 * 60 * 1000;
    case '30d': return 30 * 24 * 60 * 60 * 1000;
    case '90d': return 90 * 24 * 60 * 60 * 1000;
    default: return 30 * 24 * 60 * 60 * 1000;
  }
}

function processUsageMetrics(metrics: any[]): UsageData {
  const apiCalls = metrics.filter(m => m.metric_type === 'api_call').length;
  const documentsProcessed = metrics.filter(m => m.metric_type === 'document_processed').length;
  
  // Mock data for demo purposes
  return {
    apiCalls,
    apiCallsChange: Math.round(Math.random() * 50),
    documentsProcessed,
    documentsChange: Math.round(Math.random() * 30),
    activeUsers: Math.round(Math.random() * 100) + 50,
    lastActiveTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    dataStorage: `${(Math.random() * 50 + 10).toFixed(1)} GB`,
  };
}

function generateQuotaData(usage: UsageData): QuotaData[] {
  return [
    {
      metric: 'API Calls',
      used: usage.apiCalls,
      limit: 10000,
    },
    {
      metric: 'Documents Processed',
      used: usage.documentsProcessed,
      limit: 1000,
    },
    {
      metric: 'Active Users',
      used: usage.activeUsers,
      limit: 500,
    },
    {
      metric: 'Data Storage',
      used: parseFloat(usage.dataStorage.split(' ')[0]),
      limit: 100,
    },
  ];
}

function generateTrendsData(metrics: any[], period: string): TrendsData {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return date.toISOString().split('T')[0];
  });

  return {
    usage: dates.map(date => ({
      date,
      apiCalls: Math.round(Math.random() * 200) + 50,
      documents: Math.round(Math.random() * 50) + 10,
    })),
    features: [
      { feature: 'KYC Verification', usage: Math.round(Math.random() * 500) + 100 },
      { feature: 'Transaction Monitoring', usage: Math.round(Math.random() * 800) + 200 },
      { feature: 'Document Processing', usage: Math.round(Math.random() * 300) + 80 },
      { feature: 'Risk Assessment', usage: Math.round(Math.random() * 400) + 150 },
      { feature: 'Compliance Reports', usage: Math.round(Math.random() * 200) + 50 },
    ],
    apiEndpoints: [
      { endpoint: '/api/kyc/verify', calls: Math.round(Math.random() * 1000) + 200, errors: Math.round(Math.random() * 50) },
      { endpoint: '/api/transactions/monitor', calls: Math.round(Math.random() * 800) + 150, errors: Math.round(Math.random() * 30) },
      { endpoint: '/api/documents/process', calls: Math.round(Math.random() * 600) + 100, errors: Math.round(Math.random() * 20) },
      { endpoint: '/api/risk/assess', calls: Math.round(Math.random() * 400) + 80, errors: Math.round(Math.random() * 15) },
    ],
    performance: dates.slice(-24).map((_, i) => ({
      time: `${i}:00`,
      avgResponseTime: Math.round(Math.random() * 300) + 100,
    })),
    errors: dates.map(date => ({
      date,
      errorRate: Math.random() * 5,
    })),
  };
}