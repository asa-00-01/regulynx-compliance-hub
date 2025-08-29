
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DetectedPattern } from '@/types/pattern';
import { patternDetectionService, PatternDetectionResult } from '@/services/patternDetectionService';
import { useAuth } from '@/context/AuthContext';

export const usePatternDetection = () => {
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [statistics, setStatistics] = useState<PatternDetectionResult['statistics'] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const runPatternAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Get the current customer ID from user context
      const customerId = user?.customer_id;

      // Run the actual pattern analysis
      const result = await patternDetectionService.runAnalysis(customerId);

      setPatterns(result.patterns);
      setStatistics(result.statistics);
      
      toast({
        title: 'Pattern Analysis Complete',
        description: `Detected ${result.patterns.length} suspicious patterns with ${result.statistics.totalDetections} total detections`,
      });
    } catch (error) {
      console.error('Pattern analysis failed:', error);
      toast({
        title: 'Analysis Error',
        description: error instanceof Error ? error.message : 'Failed to complete pattern analysis',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updatePatternTransactions = (updatedTransaction: DetectedPattern['transactions'][0]) => {
    setPatterns(prevPatterns =>
      prevPatterns.map(pattern => ({
        ...pattern,
        transactions: pattern.transactions.map(t =>
          t.id === updatedTransaction.id ? updatedTransaction : t
        )
      }))
    );
  };

  const triggerDetectionForTransaction = async (transactionId: string) => {
    try {
      const customerId = user?.customer_id;
      if (!customerId) {
        throw new Error('No customer ID available');
      }

      const result = await patternDetectionService.triggerDetectionForTransaction(transactionId, customerId);
      
      toast({
        title: 'Pattern Detection Triggered',
        description: `Pattern detection completed for transaction. Detected ${result.patterns_detected} patterns.`,
      });

      return result;
    } catch (error) {
      console.error('Failed to trigger pattern detection:', error);
      toast({
        title: 'Detection Error',
        description: error instanceof Error ? error.message : 'Failed to trigger pattern detection',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getStatistics = async (dateFrom?: string, dateTo?: string) => {
    try {
      const customerId = user?.customer_id;
      const stats = await patternDetectionService.getStatistics(customerId, dateFrom, dateTo);
      return stats;
    } catch (error) {
      console.error('Failed to get statistics:', error);
      throw error;
    }
  };

  const getRecentAlerts = async (limit: number = 10) => {
    try {
      const customerId = user?.customer_id;
      const alerts = await patternDetectionService.getRecentAlerts(customerId, limit);
      return alerts;
    } catch (error) {
      console.error('Failed to get recent alerts:', error);
      throw error;
    }
  };

  return {
    patterns,
    statistics,
    isAnalyzing,
    runPatternAnalysis,
    updatePatternTransactions,
    triggerDetectionForTransaction,
    getStatistics,
    getRecentAlerts,
  };
};
