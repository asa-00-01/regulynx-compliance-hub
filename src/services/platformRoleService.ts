
import { supabase } from '@/integrations/supabase/client';
import { PlatformRole, CustomerRole } from '@/types/platform-roles';

export const platformRoleService = {
  async assignPlatformRole(userId: string, role: PlatformRole) {
    const { data, error } = await supabase
      .from('platform_roles')
      .insert({ user_id: userId, role })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removePlatformRole(userId: string, role: PlatformRole) {
    const { error } = await supabase
      .from('platform_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
    
    if (error) throw error;
  },

  async assignCustomerRole(userId: string, customerId: string, role: CustomerRole) {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({ 
        user_id: userId, 
        customer_id: customerId, 
        role 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeCustomerRole(userId: string, customerId: string, role: CustomerRole) {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('customer_id', customerId)
      .eq('role', role);
    
    if (error) throw error;
  },

  async getUserPlatformRoles(userId: string) {
    const { data, error } = await supabase
      .from('platform_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data?.map(r => r.role) || [];
  },

  async getUserCustomerRoles(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, customer_id')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  async checkPlatformRole(userId: string, role: PlatformRole) {
    const { data, error } = await supabase
      .rpc('has_platform_role', { _user_id: userId, _role: role });
    
    if (error) throw error;
    return data;
  }
};
