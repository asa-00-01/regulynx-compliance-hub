
import { supabase } from '@/integrations/supabase/client';
import { PlatformRole, CustomerRole, Customer } from '@/types/platform-roles';
import { CustomerInsert } from '@/types/supabase';

export class PlatformRoleService {
  // Customer management
  static async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customerData as CustomerInsert)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getCustomer(customerId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async listCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
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
      .insert({ user_id: userId, customer_id: customerId, role });
    
    if (error && error.code !== '23505') throw error; // Ignore unique constraint violations
  }

  static async removeCustomerRole(userId: string, customerId: string, role: CustomerRole): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('customer_id', customerId)
      .eq('role', role);
    
    if (error) throw error;
  }

  static async getUserCustomerRoles(userId: string, customerId?: string): Promise<CustomerRole[]> {
    let query = supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data?.map(r => r.role) || [];
  }
}
