import { NewsItem, RSSFeed } from '@/types/news';
import { KYCUser, KYCVerification } from '@/types/kyc';
import { AMLTransaction } from '@/types/aml';
import { unifiedMockData } from '@/mocks/centralizedMockData';
import { supabase } from '@/integrations/supabase/client';
import { config } from '@/config/environment';

export class RealDataService {
  // News and RSS Feeds - In production, these would connect to real APIs
  static async getNewsItems(): Promise<NewsItem[]> {
    console.log('🌐 Fetching news from real API...');
    
    try {
      // In a real implementation, this would call external news APIs
      // For now, we'll simulate a database call but return empty since tables don't exist
      console.warn('News API not configured, falling back to empty array');
      return [];
    } catch (error) {
      console.warn('News service unavailable, returning empty array:', error);
      return [];
    }
  }

  static async getRSSFeeds(): Promise<RSSFeed[]> {
    console.log('🌐 Fetching RSS feeds from real API...');
    
    try {
      // In a real implementation, this would call external RSS APIs
      console.warn('RSS API not configured, falling back to empty array');
      return [];
    } catch (error) {
      console.warn('RSS service unavailable, returning empty array:', error);
      return [];
    }
  }

  // KYC Users - Map from existing organization_customers table
  static async getKYCUsers(filters?: any): Promise<KYCUser[]> {
    console.log('🌐 Fetching KYC users from database...');
    
    try {
      let query = supabase.from('organization_customers').select('*');
      
      if (filters?.status) {
        query = query.eq('kyc_status', filters.status);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) {
        console.warn('KYC database error, falling back to empty array:', error.message);
        return [];
      }
      
      // Transform organization_customers data to KYCUser format
      const kycUsers: KYCUser[] = (data || []).map(customer => ({
        id: customer.id,
        fullName: customer.full_name,
        email: customer.email || '',
        dateOfBirth: customer.date_of_birth ? customer.date_of_birth.toString() : '',
        identityNumber: customer.identity_number || '',
        phoneNumber: customer.phone_number,
        address: customer.address,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at
      }));
      
      return kycUsers;
    } catch (error) {
      console.warn('KYC service unavailable, returning empty array:', error);
      return [];
    }
  }

  static async getKYCVerifications(): Promise<KYCVerification[]> {
    console.log('🌐 Fetching KYC verifications from database...');
    
    try {
      // Map from organization_customers to create verification records
      const { data, error } = await supabase
        .from('organization_customers')
        .select('*')
        .limit(100);
      
      if (error) {
        console.warn('KYC verifications not configured, falling back to empty array:', error.message);
        return [];
      }
      
      // Transform to KYCVerification format
      const verifications: KYCVerification[] = (data || []).map(customer => ({
        userId: customer.id,
        status: customer.kyc_status as 'verified' | 'pending' | 'rejected' | 'information_requested',
        verifiedBy: customer.created_by || undefined,
        verifiedAt: customer.updated_at,
        rejectionReason: undefined,
        notes: undefined
      }));
      
      return verifications;
    } catch (error) {
      console.warn('KYC verifications service unavailable, returning empty array:', error);
      return [];
    }
  }

  // AML Transactions - Use existing aml_transactions table
  static async getAMLTransactions(filters?: any): Promise<AMLTransaction[]> {
    console.log('🌐 Fetching AML transactions from database...');
    
    try {
      let query = supabase.from('aml_transactions').select(`
        *,
        organization_customers!inner(full_name)
      `);
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.riskLevel) {
        if (filters.riskLevel === 'low') {
          query = query.lte('risk_score', 30);
        } else if (filters.riskLevel === 'medium') {
          query = query.gt('risk_score', 30).lte('risk_score', 70);
        } else if (filters.riskLevel === 'high') {
          query = query.gt('risk_score', 70);
        }
      }
      
      const { data, error } = await query.limit(500);
      
      if (error) {
        console.warn('AML database error, falling back to empty array:', error.message);
        return [];
      }
      
      // Transform to AMLTransaction format - matching the interface from src/types/aml.ts
      const transactions: AMLTransaction[] = (data || []).map(tx => ({
        id: tx.id,
        senderUserId: tx.organization_customer_id,
        senderName: (tx as any).organization_customers?.full_name || 'Unknown',
        receiverUserId: tx.to_account, // Using to_account as receiver identifier
        receiverName: 'Unknown Receiver', // Would need additional join for receiver info
        senderAmount: parseFloat(tx.amount.toString()),
        senderCurrency: tx.currency as 'SEK' | 'USD' | 'EUR' | 'GBP',
        receiverAmount: parseFloat(tx.amount.toString()),
        receiverCurrency: tx.currency as 'SEK' | 'USD' | 'EUR' | 'GBP',
        senderCountryCode: 'US', // Would need additional data for proper country codes
        receiverCountryCode: 'US', // Would need additional data for proper country codes
        timestamp: tx.transaction_date,
        status: tx.status as 'completed' | 'pending' | 'failed' | 'flagged',
        reasonForSending: tx.description || 'No reason provided',
        method: 'bank' as const, // Would need additional data for proper method
        isSuspect: tx.status === 'flagged',
        riskScore: tx.risk_score,
        notes: Array.isArray(tx.flags) ? tx.flags.map(flag => String(flag)).join(', ') : String(tx.flags || '')
      }));
      
      return transactions;
    } catch (error) {
      console.warn('AML service unavailable, returning empty array:', error);
      return [];
    }
  }

  // Unified User Data - Aggregate from existing tables
  static async getUnifiedUserData(filters?: any): Promise<typeof unifiedMockData> {
    console.log('🌐 Fetching unified user data from database...');
    
    try {
      let query = supabase.from('organization_customers').select(`
        *,
        documents(*),
        aml_transactions(*),
        compliance_cases(*)
      `);
      
      if (filters?.riskLevel) {
        if (filters.riskLevel === 'low') {
          query = query.lte('risk_score', 30);
        } else if (filters.riskLevel === 'medium') {
          query = query.gt('risk_score', 30).lte('risk_score', 70);
        } else if (filters.riskLevel === 'high') {
          query = query.gt('risk_score', 70);
        }
      }
      
      if (filters?.kycStatus && filters.kycStatus.length > 0) {
        query = query.in('kyc_status', filters.kycStatus);
      }
      
      if (filters?.searchTerm) {
        const term = `%${filters.searchTerm.toLowerCase()}%`;
        query = query.or(`full_name.ilike.${term},email.ilike.${term}`);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) {
        console.warn('Unified database error, falling back to empty array:', error.message);
        return [];
      }
      
      // Transform to unified format
      const unifiedData = (data || []).map(customer => ({
        id: customer.id,
        fullName: customer.full_name,
        email: customer.email || '',
        dateOfBirth: customer.date_of_birth ? customer.date_of_birth.toString() : '',
        nationality: customer.nationality || '',
        identityNumber: customer.identity_number || '',
        phoneNumber: customer.phone_number || '',
        address: customer.address || '',
        countryOfResidence: customer.country_of_residence || '',
        riskScore: customer.risk_score,
        isPEP: customer.is_pep,
        isSanctioned: customer.is_sanctioned,
        kycStatus: customer.kyc_status as 'verified' | 'pending' | 'rejected' | 'information_requested',
        createdAt: customer.created_at,
        kycFlags: {
          userId: customer.id,
          is_registered: true,
          is_email_confirmed: !!customer.email,
          is_verified_pep: customer.is_pep,
          is_sanction_list: customer.is_sanctioned,
          riskScore: customer.risk_score
        },
        documents: (customer as any).documents || [],
        transactions: (customer as any).aml_transactions || [],
        complianceCases: (customer as any).compliance_cases || [],
        notes: []
      }));
      
      return unifiedData;
    } catch (error) {
      console.warn('Unified service unavailable, returning empty array:', error);
      return [];
    }
  }

  // Validate that real data sources are available
  static async validateDataSources(): Promise<boolean> {
    console.log('🔍 Validating real data source connections...');
    
    try {
      // Test Supabase connection with existing tables
      const { data, error } = await supabase
        .from('organization_customers')
        .select('count')
        .limit(1);
      
      if (error) {
        console.warn('Database connection test failed:', error.message);
        return false;
      }
      
      console.log('✅ Real data sources validated successfully');
      return true;
    } catch (error) {
      console.warn('Data source validation failed:', error);
      return false;
    }
  }

  static shouldUseRealData(): boolean {
    return !config.features.useMockData;
  }

  static isRealMode(): boolean {
    return this.shouldUseRealData();
  }
}

export default RealDataService;
