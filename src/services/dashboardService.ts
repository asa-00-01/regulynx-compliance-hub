
import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  flaggedTransactions: number;
  totalTransactions: number;
  activeComplianceCases: number;
  highRiskCustomers: number;
  averageRiskScore: number;
}

export class DashboardService {
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get organization customers stats
      const { data: customers, error: customersError } = await supabase
        .from('organization_customers')
        .select('kyc_status, risk_score, is_pep, is_sanctioned');

      if (customersError) {
        console.warn('Error fetching customers:', customersError);
      }

      // Get transactions stats
      const { data: transactions, error: transactionsError } = await supabase
        .from('aml_transactions')
        .select('status, risk_score');

      if (transactionsError) {
        console.warn('Error fetching transactions:', transactionsError);
      }

      // Get compliance cases stats
      const { data: cases, error: casesError } = await supabase
        .from('compliance_cases')
        .select('status')
        .in('status', ['open', 'in_progress']);

      if (casesError) {
        console.warn('Error fetching compliance cases:', casesError);
      }

      const customerList = customers || [];
      const transactionList = transactions || [];
      const caseList = cases || [];

      const totalUsers = customerList.length;
      const verifiedUsers = customerList.filter(c => c.kyc_status === 'verified').length;
      const pendingVerifications = customerList.filter(c => c.kyc_status === 'pending').length;
      const flaggedTransactions = transactionList.filter(t => t.status === 'flagged').length;
      const totalTransactions = transactionList.length;
      const activeComplianceCases = caseList.length;
      const highRiskCustomers = customerList.filter(c => c.risk_score > 70).length;
      const averageRiskScore = customerList.length > 0 
        ? Math.round(customerList.reduce((sum, c) => sum + c.risk_score, 0) / customerList.length)
        : 0;

      return {
        totalUsers,
        verifiedUsers,
        pendingVerifications,
        flaggedTransactions,
        totalTransactions,
        activeComplianceCases,
        highRiskCustomers,
        averageRiskScore
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      
      // Return default metrics in case of error
      return {
        totalUsers: 0,
        verifiedUsers: 0,
        pendingVerifications: 0,
        flaggedTransactions: 0,
        totalTransactions: 0,
        activeComplianceCases: 0,
        highRiskCustomers: 0,
        averageRiskScore: 0
      };
    }
  }

  // Get recent activity for dashboard
  static async getRecentActivity(limit: number = 10) {
    try {
      const { data: recentCases, error } = await supabase
        .from('compliance_cases')
        .select(`
          id,
          type,
          status,
          priority,
          description,
          created_at,
          organization_customers!inner(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('Error fetching recent activity:', error);
        return [];
      }

      return recentCases || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // Get transaction trends for charts
  static async getTransactionTrends(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: transactions, error } = await supabase
        .from('aml_transactions')
        .select('transaction_date, amount, status')
        .gte('transaction_date', startDate.toISOString())
        .order('transaction_date', { ascending: true });

      if (error) {
        console.warn('Error fetching transaction trends:', error);
        return [];
      }

      return transactions || [];
    } catch (error) {
      console.error('Error fetching transaction trends:', error);
      return [];
    }
  }

  // Get risk score distribution
  static async getRiskScoreDistribution() {
    try {
      const { data: customers, error } = await supabase
        .from('organization_customers')
        .select('risk_score');

      if (error) {
        console.warn('Error fetching risk score distribution:', error);
        return { low: 0, medium: 0, high: 0, critical: 0 };
      }

      const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
      
      (customers || []).forEach(customer => {
        if (customer.risk_score <= 25) distribution.low++;
        else if (customer.risk_score <= 50) distribution.medium++;
        else if (customer.risk_score <= 75) distribution.high++;
        else distribution.critical++;
      });

      return distribution;
    } catch (error) {
      console.error('Error fetching risk score distribution:', error);
      return { low: 0, medium: 0, high: 0, critical: 0 };
    }
  }
}

export default DashboardService;
