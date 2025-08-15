
import { supabase } from '@/integrations/supabase/client';
import { 
  OrganizationCustomer, 
  OrganizationCustomerInsert, 
  OrganizationCustomerUpdate,
  EnrichedOrganizationCustomer,
  OrganizationCustomerFilters,
  OrganizationCustomerStats,
  AMLTransaction,
  Document,
  ComplianceCase
} from '@/types/organization-customers';

export class OrganizationCustomerService {
  // Get all organization customers for a specific customer (SaaS customer)
  static async getOrganizationCustomers(
    customerId: string,
    filters?: OrganizationCustomerFilters
  ): Promise<EnrichedOrganizationCustomer[]> {
    let query = supabase
      .from('organization_customers')
      .select(`
        *,
        aml_transactions (
          id,
          amount,
          transaction_date,
          risk_score,
          status
        ),
        documents:documents!organization_customer_id (
          id,
          type,
          status,
          created_at
        ),
        compliance_cases:compliance_cases!organization_customer_id (
          id,
          type,
          status,
          risk_score,
          created_at
        )
      `)
      .eq('customer_id', customerId);

    // Apply filters
    if (filters?.searchTerm) {
      query = query.or(`full_name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`);
    }

    if (filters?.kycStatus && filters.kycStatus.length > 0) {
      query = query.in('kyc_status', filters.kycStatus);
    }

    if (filters?.country) {
      query = query.eq('country_of_residence', filters.country);
    }

    if (filters?.isPEP !== undefined) {
      query = query.eq('is_pep', filters.isPEP);
    }

    if (filters?.isSanctioned !== undefined) {
      query = query.eq('is_sanctioned', filters.isSanctioned);
    }

    if (filters?.riskLevel) {
      const riskRanges = {
        low: [0, 25],
        medium: [26, 50],
        high: [51, 75],
        critical: [76, 100]
      };
      const [min, max] = riskRanges[filters.riskLevel];
      query = query.gte('risk_score', min).lte('risk_score', max);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich the data with computed fields and proper type casting
    return (data || []).map(customer => ({
      ...customer,
      kyc_status: customer.kyc_status as 'verified' | 'pending' | 'rejected' | 'information_requested',
      transactionCount: customer.aml_transactions?.length || 0,
      lastTransactionDate: customer.aml_transactions?.[0]?.transaction_date,
      complianceCaseCount: customer.compliance_cases?.length || 0,
      documentCount: customer.documents?.length || 0,
      transactions: (customer.aml_transactions || []).map(tx => ({
        ...tx,
        flags: Array.isArray(tx.flags) ? tx.flags : []
      })) as AMLTransaction[],
      documents: (customer.documents || []).map(doc => ({
        ...doc,
        type: doc.type as Document['type'],
        status: doc.status as Document['status']
      })) as Document[],
      complianceCases: (customer.compliance_cases || []).map(case_ => ({
        ...case_,
        type: case_.type as ComplianceCase['type'],
        status: case_.status as ComplianceCase['status']
      })) as ComplianceCase[]
    }));
  }

  // Get a single organization customer with full details
  static async getOrganizationCustomer(customerId: string): Promise<EnrichedOrganizationCustomer | null> {
    const { data, error } = await supabase
      .from('organization_customers')
      .select(`
        *,
        aml_transactions (*),
        documents:documents!organization_customer_id (*),
        compliance_cases:compliance_cases!organization_customer_id (*)
      `)
      .eq('id', customerId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      kyc_status: data.kyc_status as 'verified' | 'pending' | 'rejected' | 'information_requested',
      transactionCount: data.aml_transactions?.length || 0,
      lastTransactionDate: data.aml_transactions?.[0]?.transaction_date,
      complianceCaseCount: data.compliance_cases?.length || 0,
      documentCount: data.documents?.length || 0,
      transactions: (data.aml_transactions || []).map(tx => ({
        ...tx,
        flags: Array.isArray(tx.flags) ? tx.flags : []
      })) as AMLTransaction[],
      documents: (data.documents || []).map(doc => ({
        ...doc,
        type: doc.type as Document['type'],
        status: doc.status as Document['status']
      })) as Document[],
      complianceCases: (data.compliance_cases || []).map(case_ => ({
        ...case_,
        type: case_.type as ComplianceCase['type'],
        status: case_.status as ComplianceCase['status']
      })) as ComplianceCase[]
    };
  }

  // Create a new organization customer
  static async createOrganizationCustomer(
    customerData: OrganizationCustomerInsert
  ): Promise<OrganizationCustomer> {
    const { data, error } = await supabase
      .from('organization_customers')
      .insert(customerData)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      kyc_status: data.kyc_status as 'verified' | 'pending' | 'rejected' | 'information_requested'
    };
  }

  // Update an organization customer
  static async updateOrganizationCustomer(
    customerId: string,
    updates: OrganizationCustomerUpdate
  ): Promise<OrganizationCustomer> {
    const { data, error } = await supabase
      .from('organization_customers')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      kyc_status: data.kyc_status as 'verified' | 'pending' | 'rejected' | 'information_requested'
    };
  }

  // Delete an organization customer
  static async deleteOrganizationCustomer(customerId: string): Promise<void> {
    const { error } = await supabase
      .from('organization_customers')
      .delete()
      .eq('id', customerId);

    if (error) throw error;
  }

  // Get statistics for organization customers
  static async getOrganizationCustomerStats(customerId: string): Promise<OrganizationCustomerStats> {
    const { data: customers, error } = await supabase
      .from('organization_customers')
      .select('kyc_status, risk_score, is_pep, is_sanctioned')
      .eq('customer_id', customerId);

    if (error) throw error;

    const totalCustomers = customers?.length || 0;
    const verifiedCustomers = customers?.filter(c => c.kyc_status === 'verified').length || 0;
    const pendingCustomers = customers?.filter(c => c.kyc_status === 'pending').length || 0;
    const rejectedCustomers = customers?.filter(c => c.kyc_status === 'rejected').length || 0;
    const highRiskCustomers = customers?.filter(c => c.risk_score > 70).length || 0;
    const pepCustomers = customers?.filter(c => c.is_pep).length || 0;
    const sanctionedCustomers = customers?.filter(c => c.is_sanctioned).length || 0;
    const averageRiskScore = customers?.reduce((sum, c) => sum + c.risk_score, 0) / totalCustomers || 0;

    return {
      totalCustomers,
      verifiedCustomers,
      pendingCustomers,
      rejectedCustomers,
      highRiskCustomers,
      pepCustomers,
      sanctionedCustomers,
      averageRiskScore: Math.round(averageRiskScore)
    };
  }

  // Get transactions for an organization customer
  static async getOrganizationCustomerTransactions(
    organizationCustomerId: string
  ): Promise<AMLTransaction[]> {
    const { data, error } = await supabase
      .from('aml_transactions')
      .select('*')
      .eq('organization_customer_id', organizationCustomerId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(tx => ({
      ...tx,
      flags: Array.isArray(tx.flags) ? tx.flags : []
    })) as AMLTransaction[];
  }

  // Update KYC status
  static async updateKYCStatus(
    customerId: string,
    status: 'verified' | 'pending' | 'rejected' | 'information_requested',
    notes?: string
  ): Promise<OrganizationCustomer> {
    const updates: OrganizationCustomerUpdate = {
      kyc_status: status,
      updated_at: new Date().toISOString()
    };

    return this.updateOrganizationCustomer(customerId, updates);
  }

  // Update risk score
  static async updateRiskScore(
    customerId: string,
    riskScore: number
  ): Promise<OrganizationCustomer> {
    const updates: OrganizationCustomerUpdate = {
      risk_score: riskScore,
      updated_at: new Date().toISOString()
    };

    return this.updateOrganizationCustomer(customerId, updates);
  }

  // Bulk import organization customers
  static async bulkImportOrganizationCustomers(
    customers: OrganizationCustomerInsert[]
  ): Promise<OrganizationCustomer[]> {
    const { data, error } = await supabase
      .from('organization_customers')
      .insert(customers)
      .select();

    if (error) throw error;
    
    return (data || []).map(customer => ({
      ...customer,
      kyc_status: customer.kyc_status as 'verified' | 'pending' | 'rejected' | 'information_requested'
    }));
  }
}
