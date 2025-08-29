import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transaction';
import { AMLTransaction } from '@/types/aml';
import { config } from '@/config/environment';

export interface TransactionFilters {
  status?: string;
  amountRange?: { min?: number; max?: number };
  dateRange?: { from?: Date; to?: Date };
  riskLevel?: 'low' | 'medium' | 'high';
  searchTerm?: string;
  customerId?: string;
}

export interface TransactionStats {
  totalTransactions: number;
  flaggedTransactions: number;
  totalVolume: number;
  uniqueUsers: number;
  averageRiskScore: number;
  statusBreakdown: {
    completed: number;
    pending: number;
    flagged: number;
    failed: number;
  };
}

export class TransactionService {
  /**
   * Fetch transactions from the database and transform them to the expected format
   */
  static async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    console.log('🌐 Fetching transactions from database...');
    
    try {
      let query = supabase
        .from('aml_transactions')
        .select(`
          *,
          organization_customers!inner(
            id,
            full_name,
            email,
            kyc_status,
            risk_score
          )
        `);

      // Apply filters
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.riskLevel) {
        switch (filters.riskLevel) {
          case 'low':
            query = query.lte('risk_score', 30);
            break;
          case 'medium':
            query = query.gt('risk_score', 30).lte('risk_score', 70);
            break;
          case 'high':
            query = query.gt('risk_score', 70);
            break;
        }
      }

      if (filters?.amountRange?.min) {
        query = query.gte('amount', filters.amountRange.min);
      }

      if (filters?.amountRange?.max) {
        query = query.lte('amount', filters.amountRange.max);
      }

      if (filters?.dateRange?.from) {
        query = query.gte('transaction_date', filters.dateRange.from.toISOString());
      }

      if (filters?.dateRange?.to) {
        query = query.lte('transaction_date', filters.dateRange.to.toISOString());
      }

      const { data, error } = await query
        .order('transaction_date', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      // Transform to Transaction format
      const transactions: Transaction[] = (data || []).map(tx => ({
        id: tx.id,
        userId: tx.organization_customer_id,
        userName: tx.organization_customers?.full_name || 'Unknown User',
        amount: Number(tx.amount),
        currency: tx.currency as 'USD' | 'EUR' | 'GBP' | 'SEK',
        method: tx.transaction_type as 'transfer' | 'payment' | 'international_transfer' | 'internal_transfer' | 'online_payment' | 'crypto_purchase' | 'gambling',
        status: tx.status as 'pending' | 'approved' | 'rejected' | 'flagged',
        timestamp: tx.transaction_date,
        riskScore: tx.risk_score,
        flagged: tx.status === 'flagged' || (tx.flags && Array.isArray(tx.flags) && tx.flags.length > 0),
        description: tx.description || '',
        fromAccount: tx.from_account,
        toAccount: tx.to_account,
        externalId: tx.external_transaction_id,
        flags: Array.isArray(tx.flags) ? tx.flags.map(f => String(f)) : []
      }));

      // Apply search filter if provided
      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        return transactions.filter(tx => 
          tx.userName.toLowerCase().includes(searchTerm) ||
          tx.id.toLowerCase().includes(searchTerm) ||
          tx.externalId.toLowerCase().includes(searchTerm) ||
          tx.description.toLowerCase().includes(searchTerm)
        );
      }

      return transactions;

    } catch (error) {
      console.error('Error in getTransactions:', error);
      return [];
    }
  }

  /**
   * Get transaction statistics
   */
  static async getTransactionStats(customerId?: string): Promise<TransactionStats> {
    try {
      let query = supabase
        .from('aml_transactions')
        .select('*');

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transaction stats:', error);
        return {
          totalTransactions: 0,
          flaggedTransactions: 0,
          totalVolume: 0,
          uniqueUsers: 0,
          averageRiskScore: 0,
          statusBreakdown: {
            completed: 0,
            pending: 0,
            flagged: 0,
            failed: 0
          }
        };
      }

      const transactions = data || [];
      const uniqueUsers = new Set(transactions.map(tx => tx.organization_customer_id)).size;
      const totalVolume = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
      const averageRiskScore = transactions.length > 0 
        ? transactions.reduce((sum, tx) => sum + tx.risk_score, 0) / transactions.length 
        : 0;

      const statusBreakdown = {
        completed: transactions.filter(tx => tx.status === 'approved').length,
        pending: transactions.filter(tx => tx.status === 'pending').length,
        flagged: transactions.filter(tx => tx.status === 'flagged').length,
        failed: transactions.filter(tx => tx.status === 'rejected').length
      };

      return {
        totalTransactions: transactions.length,
        flaggedTransactions: transactions.filter(tx => tx.status === 'flagged').length,
        totalVolume,
        uniqueUsers,
        averageRiskScore: Math.round(averageRiskScore),
        statusBreakdown
      };

    } catch (error) {
      console.error('Error in getTransactionStats:', error);
      return {
        totalTransactions: 0,
        flaggedTransactions: 0,
        totalVolume: 0,
        uniqueUsers: 0,
        averageRiskScore: 0,
        statusBreakdown: {
          completed: 0,
          pending: 0,
          flagged: 0,
          failed: 0
        }
      };
    }
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    transactionId: string, 
    status: 'pending' | 'approved' | 'rejected' | 'flagged'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('aml_transactions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', transactionId);

      if (error) {
        console.error('Error updating transaction status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateTransactionStatus:', error);
      return false;
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(transactionId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('aml_transactions')
        .select(`
          *,
          organization_customers!inner(
            id,
            full_name,
            email,
            kyc_status,
            risk_score
          )
        `)
        .eq('id', transactionId)
        .single();

      if (error || !data) {
        console.error('Error fetching transaction:', error);
        return null;
      }

      return {
        id: data.id,
        userId: data.organization_customer_id,
        userName: data.organization_customers?.full_name || 'Unknown User',
        amount: Number(data.amount),
        currency: data.currency as 'USD' | 'EUR' | 'GBP' | 'SEK',
        method: data.transaction_type as 'transfer' | 'payment' | 'international_transfer' | 'internal_transfer' | 'online_payment' | 'crypto_purchase' | 'gambling',
        status: data.status as 'pending' | 'approved' | 'rejected' | 'flagged',
        timestamp: data.transaction_date,
        riskScore: data.risk_score,
        flagged: data.status === 'flagged' || (data.flags && Array.isArray(data.flags) && data.flags.length > 0),
        description: data.description || '',
        fromAccount: data.from_account,
        toAccount: data.to_account,
        externalId: data.external_transaction_id,
        flags: Array.isArray(data.flags) ? data.flags.map(f => String(f)) : []
      };

    } catch (error) {
      console.error('Error in getTransactionById:', error);
      return null;
    }
  }

  /**
   * Export transactions to CSV
   */
  static async exportTransactions(filters?: TransactionFilters): Promise<string> {
    const transactions = await this.getTransactions(filters);
    
    const headers = [
      'Transaction ID',
      'User Name',
      'Amount',
      'Currency',
      'Type',
      'Status',
      'Risk Score',
      'Date',
      'Description',
      'From Account',
      'To Account'
    ];

    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        tx.id,
        `"${tx.userName}"`,
        tx.amount,
        tx.currency,
        tx.method,
        tx.status,
        tx.riskScore,
        new Date(tx.timestamp).toISOString(),
        `"${tx.description}"`,
        `"${tx.fromAccount}"`,
        `"${tx.toAccount}"`
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}
