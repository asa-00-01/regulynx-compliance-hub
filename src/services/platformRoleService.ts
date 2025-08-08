
import { supabase } from '@/integrations/supabase/client';
import { PlatformRole, CustomerRole, Customer } from '@/types/platform-roles';

export class PlatformRoleService {
  // For now, return mock customers since the table might not be available in types yet
  static async listCustomers(): Promise<Customer[]> {
    // Try to query customers table, but fallback to mock data if not available
    try {
      const { data, error } = await supabase
        .from('profiles') // Use profiles as a temporary fallback
        .select('*')
        .limit(10);
      
      if (error) throw error;
      
      // Transform profiles to customer-like objects for now
      return data?.map(profile => ({
        id: profile.id,
        name: profile.name,
        domain: null,
        settings: {},
        subscription_tier: 'basic',
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      })) || [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  }

  static async getCustomers(): Promise<Customer[]> {
    return this.listCustomers();
  }

  static async getCustomer(customerId: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('profiles') // Use profiles as temporary fallback
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return {
        id: data.id,
        name: data.name,
        domain: null,
        settings: {},
        subscription_tier: 'basic',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  }

  static async getCustomerUsers(customerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId); // This is a simplified approach
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching customer users:', error);
      return [];
    }
  }

  static async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    // For now, create a mock customer response
    const mockCustomer: Customer = {
      id: crypto.randomUUID(),
      name: customerData.name || 'New Customer',
      domain: customerData.domain || null,
      settings: customerData.settings || {},
      subscription_tier: customerData.subscription_tier || 'basic',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return mockCustomer;
  }

  static async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    // For now, return a mock updated customer
    const existingCustomer = await this.getCustomer(customerId);
    if (!existingCustomer) {
      throw new Error('Customer not found');
    }
    
    return {
      ...existingCustomer,
      ...updates,
      updated_at: new Date().toISOString(),
    };
  }

  // Platform role management
  static async assignPlatformRole(userId: string, role: PlatformRole): Promise<void> {
    const { error } = await supabase
      .from('platform_roles')
      .insert({ user_id: userId, role });
    
    if (error && error.code !== '23505') throw error; // Ignore unique constraint violations
  }

  static async removePlatformRole(userId: string, role: PlatformRole): Promise<void> {
    const { error } = await supabase
      .from('platform_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
    
    if (error) throw error;
  }

  static async getUserPlatformRoles(userId: string): Promise<PlatformRole[]> {
    const { data, error } = await supabase
      .from('platform_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data?.map(r => r.role) || [];
  }

  // Customer role management
  static async assignCustomerRole(userId: string, customerId: string, role: CustomerRole): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role });
    
    if (error && error.code !== '23505') throw error; // Ignore unique constraint violations
  }

  static async removeCustomerRole(userId: string, customerId: string, role: CustomerRole): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
    
    if (error) throw error;
  }

  static async getUserCustomerRoles(userId: string, customerId?: string): Promise<CustomerRole[]> {
    let query = supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data?.map(r => r.role) || [];
  }
}
