import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CustomerRole = 'compliance_officer' | 'executive' | 'analyst' | 'support';
export type PlatformRole = 'platform_admin' | 'developer' | 'system_admin';

export interface UserPermissions {
  // Customer-facing features
  canViewCompliance: boolean;
  canManageCases: boolean;
  canViewReports: boolean;
  canManageKYC: boolean;
  canViewTransactions: boolean;
  canManageDocuments: boolean;
  canViewAnalytics: boolean;
  
  // Platform management features
  canManagePlatform: boolean;
  canManageUsers: boolean;
  canViewDeveloperTools: boolean;
  canManageIntegrations: boolean;
  canViewSystemLogs: boolean;
  canManageSubscriptions: boolean;
}

export const useRoleBasedPermissions = () => {
  const [customerRoles, setCustomerRoles] = useState<CustomerRole[]>([]);
  const [platformRoles, setPlatformRoles] = useState<PlatformRole[]>([]);
  const [permissions, setPermissions] = useState<UserPermissions>({
    canViewCompliance: false,
    canManageCases: false,
    canViewReports: false,
    canManageKYC: false,
    canViewTransactions: false,
    canManageDocuments: false,
    canViewAnalytics: false,
    canManagePlatform: false,
    canManageUsers: false,
    canViewDeveloperTools: false,
    canManageIntegrations: false,
    canViewSystemLogs: false,
    canManageSubscriptions: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCustomerRoles([]);
        setPlatformRoles([]);
        setLoading(false);
        return;
      }

      // Fetch customer roles
      const { data: customerRoleData, error: customerError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (customerError) throw customerError;

      // Fetch platform roles
      const { data: platformRoleData, error: platformError } = await supabase
        .from('platform_roles')
        .select('role')
        .eq('user_id', user.id);

      if (platformError) throw platformError;

      const userCustomerRoles = customerRoleData?.map(r => r.role as CustomerRole) || [];
      const userPlatformRoles = platformRoleData?.map(r => r.role as PlatformRole) || [];

      setCustomerRoles(userCustomerRoles);
      setPlatformRoles(userPlatformRoles);

      // Calculate permissions based on roles
      const newPermissions = calculatePermissions(userCustomerRoles, userPlatformRoles);
      setPermissions(newPermissions);

    } catch (error) {
      console.error('Error fetching user roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserRoles();
      } else if (event === 'SIGNED_OUT') {
        setCustomerRoles([]);
        setPlatformRoles([]);
        setPermissions({
          canViewCompliance: false,
          canManageCases: false,
          canViewReports: false,
          canManageKYC: false,
          canViewTransactions: false,
          canManageDocuments: false,
          canViewAnalytics: false,
          canManagePlatform: false,
          canManageUsers: false,
          canViewDeveloperTools: false,
          canManageIntegrations: false,
          canViewSystemLogs: false,
          canManageSubscriptions: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasCustomerRole = (role: CustomerRole) => customerRoles.includes(role);
  const hasPlatformRole = (role: PlatformRole) => platformRoles.includes(role);
  const isPlatformUser = platformRoles.length > 0;
  const isCustomerUser = customerRoles.length > 0;

  return {
    customerRoles,
    platformRoles,
    permissions,
    loading,
    hasCustomerRole,
    hasPlatformRole,
    isPlatformUser,
    isCustomerUser,
    refreshRoles: fetchUserRoles,
  };
};

function calculatePermissions(customerRoles: CustomerRole[], platformRoles: PlatformRole[]): UserPermissions {
  const permissions: UserPermissions = {
    canViewCompliance: false,
    canManageCases: false,
    canViewReports: false,
    canManageKYC: false,
    canViewTransactions: false,
    canManageDocuments: false,
    canViewAnalytics: false,
    canManagePlatform: false,
    canManageUsers: false,
    canViewDeveloperTools: false,
    canManageIntegrations: false,
    canViewSystemLogs: false,
    canManageSubscriptions: false,
  };

  // Customer role permissions
  if (customerRoles.includes('compliance_officer') || customerRoles.includes('executive')) {
    permissions.canViewCompliance = true;
    permissions.canManageCases = true;
    permissions.canViewReports = true;
    permissions.canManageKYC = true;
    permissions.canViewTransactions = true;
    permissions.canViewAnalytics = true;
  }

  if (customerRoles.includes('analyst')) {
    permissions.canViewCompliance = true;
    permissions.canViewReports = true;
    permissions.canViewTransactions = true;
    permissions.canViewAnalytics = true;
  }

  if (customerRoles.includes('support')) {
    permissions.canManageDocuments = true;
    permissions.canViewReports = true;
  }

  // Platform role permissions
  if (platformRoles.includes('platform_admin')) {
    permissions.canManagePlatform = true;
    permissions.canManageUsers = true;
    permissions.canViewDeveloperTools = true;
    permissions.canManageIntegrations = true;
    permissions.canViewSystemLogs = true;
    permissions.canManageSubscriptions = true;
  }

  if (platformRoles.includes('developer')) {
    permissions.canViewDeveloperTools = true;
    permissions.canManageIntegrations = true;
    permissions.canViewSystemLogs = true;
  }

  if (platformRoles.includes('system_admin')) {
    permissions.canManageUsers = true;
    permissions.canViewSystemLogs = true;
    permissions.canManageSubscriptions = true;
  }

  return permissions;
}