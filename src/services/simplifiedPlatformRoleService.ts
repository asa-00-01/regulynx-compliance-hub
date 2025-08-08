
import { supabase } from '@/integrations/supabase/client';
import { PlatformRole, CustomerRole, ExtendedUserProfile } from '@/types/platform-roles';

export class SimplifiedPlatformRoleService {
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
      .select('*')
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
      customer: undefined, // Will be populated when customers table is available
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
  }
}
