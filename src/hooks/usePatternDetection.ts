
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mockTransactions } from '@/components/aml/mockTransactionData';
import { DetectedPattern } from '@/types/pattern';

export const usePatternDetection = () => {
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const runPatternAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate pattern detection analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      const detectedPatterns: DetectedPattern[] = [
        {
          id: 'struct_001',
          name: 'Potential Structuring',
          description: 'Multiple transactions just below $10,000 threshold',
          category: 'structuring',
          severity: 'high',
          matchCount: 12,
          lastDetected: new Date().toISOString(),
          transactions: mockTransactions.filter(t => t.senderAmount > 9000 && t.senderAmount < 10000)
        },
        {
          id: 'corridor_001',
          name: 'High-Risk Corridor Activity',
          description: 'Increased activity to sanctioned jurisdictions',
          category: 'high_risk_corridor',
          severity: 'medium',
          matchCount: 8,
          lastDetected: new Date().toISOString(),
          transactions: mockTransactions.filter(t => ['AF', 'IR', 'KP'].includes(t.receiverCountryCode))
        },
        {
          id: 'velocity_001',
          name: 'High Transaction Velocity',
          description: 'Unusual number of transactions in short time period',
          category: 'velocity',
          severity: 'medium',
          matchCount: 15,
          lastDetected: new Date().toISOString(),
          transactions: mockTransactions.slice(0, 15)
        },
        {
          id: 'time_001',
          name: 'Off-Hours Trading Pattern',
          description: 'Transactions occurring during unusual hours',
          category: 'time_pattern',
          severity: 'low',
          matchCount: 6,
          lastDetected: new Date().toISOString(),
          transactions: mockTransactions.filter(t => {
            const hour = new Date(t.timestamp).getHours();
            return hour < 6 || hour > 22;
          })
        }
      ];

      setPatterns(detectedPatterns);
      
      toast({
        title: 'Pattern Analysis Complete',
        description: `Detected ${detectedPatterns.length} suspicious patterns`,
      });
    } catch (error) {
      toast({
        title: 'Analysis Error',
        description: 'Failed to complete pattern analysis',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updatePatternTransactions = (updatedTransaction: any) => {
    setPatterns(prevPatterns =>
      prevPatterns.map(pattern => ({
        ...pattern,
        transactions: pattern.transactions.map(t =>
          t.id === updatedTransaction.id ? updatedTransaction : t
        )
      }))
    );
  };

  return {
    patterns,
    isAnalyzing,
    runPatternAnalysis,
    updatePatternTransactions,
  };
};
