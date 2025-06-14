
import { useMemo } from 'react';
import { AMLTransaction } from '@/types/aml';

export const useAMLMetrics = (filteredTransactions: AMLTransaction[]) => {
  // Calculate metrics
  const metrics = useMemo(() => {
    const totalTransactions = filteredTransactions.length;
    const flaggedTransactions = filteredTransactions.filter(t => t.isSuspect).length;
    const highRiskTransactions = filteredTransactions.filter(t => t.riskScore >= 70).length;
    const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.senderAmount, 0);

    return {
      totalTransactions,
      flaggedTransactions,
      highRiskTransactions,
      totalAmount,
    };
  }, [filteredTransactions]);

  return metrics;
};
