import { supabase } from '@/integrations/supabase/client';
import { DetectedPattern } from '@/types/pattern';

export interface PatternDetectionResult {
  patterns: DetectedPattern[];
  statistics: {
    totalDetections: number;
    alertsGenerated: number;
    resolvedDetections: number;
    pendingReview: number;
    averageConfidence: number;
    averageRiskScore: number;
    bySeverity: Record<string, number>;
    byPatternType: Record<string, number>;
  };
}

export const patternDetectionService = {
  /**
   * Run pattern analysis on existing transactions
   */
  async runAnalysis(customerId?: string): Promise<PatternDetectionResult> {
    try {
      // Get pattern detection statistics
      const { data: stats, error: statsError } = await supabase
        .rpc('get_pattern_detection_stats', {
          p_customer_id: customerId,
          p_date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
          p_date_to: new Date().toISOString().split('T')[0]
        });

      if (statsError) {
        throw new Error(`Failed to get pattern detection stats: ${statsError.message}`);
      }

      // Get pattern detections
      const { data: detections, error: detectionsError } = await supabase
        .from('pattern_detections')
        .select(`
          *,
          patterns (
            id,
            name,
            description,
            category,
            severity
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (detectionsError) {
        throw new Error(`Failed to get pattern detections: ${detectionsError.message}`);
      }

      // Get pattern alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('pattern_alerts')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (alertsError) {
        throw new Error(`Failed to get pattern alerts: ${alertsError.message}`);
      }

      // Get actual transactions from aml_transactions table
      const transactionIds = detections?.map(d => d.detection_data?.transaction_id).filter(Boolean) || [];
      let actualTransactions: Array<{
        id: string;
        organization_customer_id: string;
        amount: number;
        currency: string;
        transaction_type: string;
        transaction_date: string;
        status: string;
        risk_score: number;
        description?: string;
        organization_customers?: {
          id: string;
          full_name: string;
          email: string;
        };
      }> = [];
      
      if (transactionIds.length > 0) {
        const { data: transactions, error: transactionsError } = await supabase
          .from('aml_transactions')
          .select(`
            *,
            organization_customers (
              id,
              full_name,
              email
            )
          `)
          .in('id', transactionIds)
          .eq('customer_id', customerId);

        if (transactionsError) {
          console.warn('Failed to fetch actual transactions:', transactionsError);
        } else {
          actualTransactions = transactions || [];
        }
      }

      // Group detections by pattern
      const patternGroups = new Map<string, (typeof detections)[0][]>();
      detections?.forEach(detection => {
        const patternId = detection.pattern_id;
        if (!patternGroups.has(patternId)) {
          patternGroups.set(patternId, []);
        }
        patternGroups.get(patternId)!.push(detection);
      });

      // Convert to DetectedPattern format
      const patterns: DetectedPattern[] = Array.from(patternGroups.entries()).map(([patternId, detections]) => {
        const firstDetection = detections[0];
        const pattern = firstDetection.patterns;
        
        // Get severity distribution
        const severityCounts = detections.reduce((acc, d) => {
          acc[d.severity] = (acc[d.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Get highest severity
        const highestSeverity = Object.keys(severityCounts).reduce((highest, current) => {
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          return severityOrder[current as keyof typeof severityOrder] > severityOrder[highest as keyof typeof severityOrder] ? current : highest;
        }, 'low');

        return {
          id: patternId,
          name: pattern?.name || 'Unknown Pattern',
          description: pattern?.description || 'Pattern detection',
          category: pattern?.category || 'unknown',
          severity: highestSeverity as 'low' | 'medium' | 'high' | 'critical',
          matchCount: detections.length,
          lastDetected: firstDetection.created_at,
          transactions: detections.map(d => {
            // Find the actual transaction from aml_transactions
            const actualTransaction = actualTransactions.find(t => t.id === d.detection_data?.transaction_id);
            
            if (actualTransaction) {
              // Use actual transaction data from aml_transactions table
              const customerName = actualTransaction.organization_customers?.full_name || `Customer ${actualTransaction.organization_customer_id.substring(0, 8)}`;
              return {
                id: actualTransaction.id,
                senderUserId: actualTransaction.organization_customer_id,
                receiverUserId: actualTransaction.organization_customer_id, // For now, using same customer
                senderName: customerName,
                receiverName: customerName,
                senderAmount: actualTransaction.amount,
                senderCurrency: actualTransaction.currency,
                receiverAmount: actualTransaction.amount,
                receiverCurrency: actualTransaction.currency,
                method: actualTransaction.transaction_type,
                status: actualTransaction.status,
                timestamp: actualTransaction.transaction_date,
                senderCountryCode: 'US', // Default for now
                receiverCountryCode: 'US', // Default for now
                riskScore: actualTransaction.risk_score,
                isSuspect: d.severity === 'high' || d.severity === 'critical',
                flagged: d.severity === 'high' || d.severity === 'critical',
                reasonForSending: actualTransaction.description || 'Unknown',
                notes: `Pattern detection: ${d.detection_type || 'unknown'}`
              };
            } else {
              // Fallback to detection data if actual transaction not found
              return {
                id: d.id,
                senderUserId: d.detection_data?.sender_user_id || 'unknown',
                receiverUserId: d.detection_data?.receiver_user_id || 'unknown',
                senderName: d.detection_data?.sender_name || 'Unknown Sender',
                receiverName: d.detection_data?.receiver_name || 'Unknown Receiver',
                senderAmount: d.detection_data?.amount || 0,
                senderCurrency: d.detection_data?.currency || 'USD',
                receiverAmount: d.detection_data?.amount || 0,
                receiverCurrency: d.detection_data?.currency || 'USD',
                method: d.detection_data?.transaction_type || 'unknown',
                status: d.detection_data?.status || 'completed',
                timestamp: d.detection_data?.transaction_date || d.created_at,
                senderCountryCode: d.detection_data?.sender_country_code || 'US',
                receiverCountryCode: d.detection_data?.receiver_country_code || 'US',
                riskScore: d.risk_score || 0,
                isSuspect: d.severity === 'high' || d.severity === 'critical',
                flagged: d.severity === 'high' || d.severity === 'critical',
                reasonForSending: d.detection_data?.reason_for_sending || 'Unknown',
                notes: `Pattern detection: ${d.detection_type || 'unknown'}`
              };
            }
          }),
          alerts: alerts?.filter(a => detections.some(d => d.id === a.detection_id)) || []
        };
      });

      return {
        patterns,
        statistics: {
          totalDetections: stats?.total_detections || 0,
          alertsGenerated: stats?.alerts_generated || 0,
          resolvedDetections: stats?.resolved_detections || 0,
          pendingReview: stats?.pending_review || 0,
          averageConfidence: stats?.average_confidence || 0,
          averageRiskScore: stats?.average_risk_score || 0,
          bySeverity: stats?.by_severity || {},
          byPatternType: stats?.by_pattern_type || {}
        }
      };
    } catch (error) {
      console.error('Pattern detection analysis failed:', error);
      throw error;
    }
  },

  /**
   * Manually trigger pattern detection for a specific transaction
   */
  async triggerDetectionForTransaction(transactionId: string, customerId: string) {
    try {
      const { data, error } = await supabase
        .rpc('detect_transaction_patterns_safe', {
          p_transaction_id: transactionId,
          p_customer_id: customerId
        });

      if (error) {
        throw new Error(`Failed to trigger pattern detection: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to trigger pattern detection:', error);
      throw error;
    }
  },

  /**
   * Get pattern detection statistics
   */
  async getStatistics(customerId?: string, dateFrom?: string, dateTo?: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_pattern_detection_stats', {
          p_customer_id: customerId,
          p_date_from: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          p_date_to: dateTo || new Date().toISOString().split('T')[0]
        });

      if (error) {
        throw new Error(`Failed to get statistics: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to get pattern detection statistics:', error);
      throw error;
    }
  },

  /**
   * Get recent pattern alerts
   */
  async getRecentAlerts(customerId?: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('pattern_alerts')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get alerts: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to get pattern alerts:', error);
      throw error;
    }
  }
};
