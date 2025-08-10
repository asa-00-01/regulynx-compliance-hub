
import { useState, useEffect } from 'react';

export interface AMLMetrics {
  totalTransactions: number;
  flaggedTransactions: number;
  highRiskTransactions: number;
  totalAmount: number;
  loading: boolean;
  error?: string;
}

export const useAMLMetrics = (timeframe: string = '30d'): AMLMetrics => {
  const [metrics, setMetrics] = useState<AMLMetrics>({
    totalTransactions: 0,
    flaggedTransactions: 0,
    highRiskTransactions: 0,
    totalAmount: 0,
    loading: true
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setMetrics(prev => ({ ...prev, loading: true }));
        
        // Mock API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMetrics({
          totalTransactions: 1250,
          flaggedTransactions: 45,
          highRiskTransactions: 12,
          totalAmount: 2500000,
          loading: false
        });
      } catch (error) {
        setMetrics(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch AML metrics'
        }));
      }
    };

    fetchMetrics();
  }, [timeframe]);

  return metrics;
};
