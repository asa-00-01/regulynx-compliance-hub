
import { useState, useEffect } from 'react';
import { AMLTransaction } from '@/types/aml';

export interface AMLMetrics {
  totalTransactions: number;
  flaggedTransactions: number;
  highRiskTransactions: number;
  totalAmount: number;
  loading: boolean;
  error?: string;
}

export const useAMLMetrics = (transactions?: AMLTransaction[], timeframe: string = '30d'): AMLMetrics => {
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
        
        if (transactions) {
          // Calculate metrics from provided transactions
          const flagged = transactions.filter(t => t.isSuspect || t.flagged).length;
          const highRisk = transactions.filter(t => t.riskScore >= 75).length;
          const totalAmount = transactions.reduce((sum, t) => sum + (t.senderAmount || 0), 0);
          
          setMetrics({
            totalTransactions: transactions.length,
            flaggedTransactions: flagged,
            highRiskTransactions: highRisk,
            totalAmount,
            loading: false
          });
        } else {
          // Mock API call - replace with actual API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setMetrics({
            totalTransactions: 1250,
            flaggedTransactions: 45,
            highRiskTransactions: 12,
            totalAmount: 2500000,
            loading: false
          });
        }
      } catch (error) {
        setMetrics(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch AML metrics'
        }));
      }
    };

    fetchMetrics();
  }, [transactions, timeframe]);

  return metrics;
};
