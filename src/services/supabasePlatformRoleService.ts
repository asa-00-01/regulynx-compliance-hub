
import { supabase } from '@/integrations/supabase/client';
import { PlatformRole, CustomerRole, Customer, ExtendedUserProfile } from '@/types/platform-roles';

export class SupabasePlatformRoleService {
  // Customer management
  static async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []).map(customer => ({
      ...customer,
      settings: customer.settings as Record<string, any>
    }));
  }

  static async getCustomer(customerId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();

    if (error) throw error;
    return data ? {
      ...data,
      settings: data.settings as Record<string, any>
    } : null;
  }

  static async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: customerData.name || 'New Customer',
        domain: customerData.domain,
        subscription_tier: customerData.subscription_tier || 'basic',
        settings: customerData.settings || {}
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      settings: data.settings as Record<string, any>
    };
  }

  static async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update({
        name: updates.name,
        domain: updates.domain,
        subscription_tier: updates.subscription_tier,
        settings: updates.settings
      })
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      settings: data.settings as Record<string, any>
    };
  }

  static async deleteCustomer(customerId: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) throw error;
  }

  // User management
  static async getCustomerUsers(customerId: string): Promise<ExtendedUserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        email,
        avatar_url,
        created_at,
        updated_at,
        customer_id,
        role,
        risk_score,
        status
      `)
      .eq('customer_id', customerId);

    if (error) throw error;

    // For each user, get their platform and customer roles
    const usersWithRoles = await Promise.all(
      (data || []).map(async (profile) => {
        const [platformRoles, customerRoles, customer] = await Promise.all([
          this.getUserPlatformRoles(profile.id),
          this.getUserCustomerRoles(profile.id),
          customerId ? this.getCustomer(customerId) : Promise.resolve(null)
        ]);

        return {
          ...profile,
          platform_roles: platformRoles,
          customer_roles: customerRoles,
          customer: customer,
          isPlatformOwner: platformRoles.length > 0
        } as ExtendedUserProfile;
      })
    );

    return usersWithRoles;
  }

  // Platform role management
  static async getPlatformUsers(): Promise<ExtendedUserProfile[]> {
    // Get distinct user ids that have any platform role
    const { data: roleRows, error: rolesError } = await supabase
      .from('platform_roles')
      .select('user_id')
      .order('user_id');

    if (rolesError) throw rolesError;
    const userIds = Array.from(new Set((roleRows || []).map(r => r.user_id as string)));

    if (userIds.length === 0) return [];

    const profiles = await Promise.all(userIds.map((id) => this.getExtendedUserProfile(id)));
    return profiles.filter((p): p is ExtendedUserProfile => Boolean(p));
  }

  static async findProfileByEmail(email: string): Promise<ExtendedUserProfile | null> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!profile) return null;
    return this.getExtendedUserProfile(profile.id);
  }
  static async assignPlatformRole(userId: string, role: PlatformRole): Promise<void> {
    const { error } = await supabase
      .from('platform_roles')
      .insert({
        user_id: userId,
        role: role
      });

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      throw error;
    }
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
    return (data || []).map(row => row.role as PlatformRole);
  }

  // Customer role management
  static async assignCustomerRole(userId: string, customerId: string, role: CustomerRole): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        customer_id: customerId,
        role: role
      });

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      throw error;
    }
  }

  static async removeCustomerRole(userId: string, customerId: string, role: CustomerRole): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('customer_id', customerId)
      .eq('role', role);

    if (error) {
      console.warn('Failed to remove customer role:', error);
    }
  }

  static async getUserCustomerRoles(userId: string): Promise<CustomerRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;
      
      return (data || []).map(row => row.role as CustomerRole);
    } catch (error) {
      console.warn('Failed to get customer roles:', error);
      return [];
    }
  }

  // Extended user profile
  static async getExtendedUserProfile(userId: string): Promise<ExtendedUserProfile | null> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!profile) return null;

    const [platformRoles, customerRoles, customer] = await Promise.all([
      this.getUserPlatformRoles(userId),
      this.getUserCustomerRoles(userId),
      profile.customer_id ? this.getCustomer(profile.customer_id) : Promise.resolve(null)
    ]);

    return {
      ...profile,
      riskScore: profile.risk_score || 0,
      status: this.mapStatus(profile.status),
      platform_roles: platformRoles,
      customer_roles: customerRoles,
      customer: customer,
      isPlatformOwner: platformRoles.length > 0
    } as ExtendedUserProfile;
  }

  private static mapStatus(dbStatus: string): 'verified' | 'pending' | 'rejected' | 'information_requested' {
    switch (dbStatus) {
      case 'active':
        return 'verified';
      case 'suspended':
      case 'banned':
        return 'rejected';
      case 'pending':
      default:
        return 'pending';
    }
  }
}
