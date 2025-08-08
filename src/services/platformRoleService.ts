
import { supabase } from '@/integrations/supabase/client';
import { Customer, PlatformRole, CustomerRole, ExtendedUserProfile } from '@/types/platform-roles';

export class PlatformRoleService {
  // Customer management
  static async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getCustomer(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async createCustomer(customer: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
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

  // Get extended user profile with roles
  static async getExtendedUserProfile(userId: string): Promise<ExtendedUserProfile | null> {
    // Get basic profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) return null;

    // Get platform roles
    const { data: platformRoles, error: platformError } = await supabase
      .from('platform_roles')
      .select('role')
      .eq('user_id', userId);

    if (platformError) throw platformError;

    // Get customer roles
    const { data: customerRoles, error: customerError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (customerError) throw customerError;

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar_url: profile.avatar_url,
      customer_id: profile.customer_id,
      platform_roles: platformRoles?.map(r => r.role) || [],
      customer_roles: customerRoles?.map(r => r.role) || [],
      customer: profile.customer?.[0] || undefined,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
  }

  // Get all users with their roles for a customer
  static async getCustomerUsers(customerId: string): Promise<ExtendedUserProfile[]> {
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        profiles(
          id,
          name,
          email,
          avatar_url,
          customer_id,
          created_at,
          updated_at
        )
      `)
      .eq('customer_id', customerId);

    if (error) throw error;
    if (!userRoles) return [];

    // Group by user and aggregate roles
    const userMap = new Map<string, ExtendedUserProfile>();
    
    for (const userRole of userRoles) {
      if (!userRole.profiles) continue;
      
      const userId = userRole.user_id;
      if (userMap.has(userId)) {
        userMap.get(userId)!.customer_roles.push(userRole.role);
      } else {
        userMap.set(userId, {
          id: userRole.profiles.id,
          name: userRole.profiles.name,
          email: userRole.profiles.email,
          avatar_url: userRole.profiles.avatar_url,
          customer_id: userRole.profiles.customer_id,
          platform_roles: [],
          customer_roles: [userRole.role],
          created_at: userRole.profiles.created_at,
          updated_at: userRole.profiles.updated_at
        });
      }
    }

    // Get platform roles for each user
    for (const [userId, userProfile] of userMap) {
      const { data: platformRoles } = await supabase
        .from('platform_roles')
        .select('role')
        .eq('user_id', userId);
      
      userProfile.platform_roles = platformRoles?.map(r => r.role) || [];
    }

    return Array.from(userMap.values());
  }
}
