
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
      // For now, we'll simulate a database call with Supabase
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .limit(10);
      
      if (error) {
        console.warn('News API not configured, falling back to empty array:', error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('News service unavailable, returning empty array:', error);
      return [];
    }
  }

  static async getRSSFeeds(): Promise<RSSFeed[]> {
    console.log('🌐 Fetching RSS feeds from real API...');
    
    try {
      const { data, error } = await supabase
        .from('rss_feeds')
        .select('*')
        .limit(10);
      
      if (error) {
        console.warn('RSS API not configured, falling back to empty array:', error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('RSS service unavailable, returning empty array:', error);
      return [];
    }
  }

  // KYC Users - In production, these would connect to real databases
  static async getKYCUsers(filters?: any): Promise<KYCUser[]> {
    console.log('🌐 Fetching KYC users from database...');
    
    try {
      let query = supabase.from('kyc_users').select('*');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) {
        console.warn('KYC database not configured, falling back to empty array:', error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('KYC service unavailable, returning empty array:', error);
      return [];
    }
  }

  static async getKYCVerifications(): Promise<KYCVerification[]> {
    console.log('🌐 Fetching KYC verifications from database...');
    
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .limit(100);
      
      if (error) {
        console.warn('KYC verifications not configured, falling back to empty array:', error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('KYC verifications service unavailable, returning empty array:', error);
      return [];
    }
  }

  // AML Transactions - In production, these would connect to real transaction databases
  static async getAMLTransactions(filters?: any): Promise<AMLTransaction[]> {
    console.log('🌐 Fetching AML transactions from database...');
    
    try {
      let query = supabase.from('aml_transactions').select('*');
      
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
        console.warn('AML database not configured, falling back to empty array:', error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('AML service unavailable, returning empty array:', error);
      return [];
    }
  }

  // Unified User Data - In production, this would aggregate data from multiple sources
  static async getUnifiedUserData(filters?: any): Promise<typeof unifiedMockData> {
    console.log('🌐 Fetching unified user data from database...');
    
    try {
      let query = supabase.from('unified_users').select(`
        *,
        documents(*),
        transactions(*),
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
        console.warn('Unified database not configured, falling back to empty array:', error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('Unified service unavailable, returning empty array:', error);
      return [];
    }
  }

  // Validate that real data sources are available
  static async validateDataSources(): Promise<boolean> {
    console.log('🔍 Validating real data source connections...');
    
    try {
      // Test Supabase connection
      const { data, error } = await supabase
        .from('users')
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
