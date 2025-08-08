
import { useAuth } from '@/context/AuthContext';
import { PlatformRole, CustomerRole } from '@/types/platform-roles';

type PlatformPermission = 
  | 'platform:admin'
  | 'platform:support'
  | 'customer:manage'
  | 'customer:create'
  | 'customer:delete'
  | 'user:assign_roles'
  | 'system:configure'
  | 'analytics:global';

type CustomerPermission =
  | 'customer:admin'
  | 'customer:compliance'
  | 'customer:executive'  
  | 'customer:support'
  | 'documents:approve'
  | 'documents:view'
  | 'cases:create'
  | 'cases:assign'
  | 'cases:update'
  | 'cases:view'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:view'
  | 'reports:generate'
  | 'reports:view';

const platformRolePermissions: Record<PlatformRole, PlatformPermission[]> = {
  platform_admin: [
    'platform:admin', 'platform:support',
    'customer:manage', 'customer:create', 'customer:delete',
    'user:assign_roles', 'system:configure', 'analytics:global'
  ],
  platform_support: [
    'platform:support', 'customer:manage', 'analytics:global'
  ]
};

const customerRolePermissions: Record<CustomerRole, CustomerPermission[]> = {
  customer_admin: [
    'customer:admin', 'documents:approve', 'documents:view',
    'cases:create', 'cases:assign', 'cases:update', 'cases:view',
    'users:create', 'users:update', 'users:delete', 'users:view',
    'reports:generate', 'reports:view'
  ],
  customer_compliance: [
    'customer:compliance', 'documents:approve', 'documents:view',
    'cases:create', 'cases:assign', 'cases:update', 'cases:view',
    'reports:generate', 'reports:view'
  ],
  customer_executive: [
    'customer:executive', 'documents:view', 'cases:view',
    'users:view', 'reports:view'
  ],
  customer_support: [
    'customer:support', 'documents:view', 'cases:view'
  ]
};

export function usePlatformRoleAccess() {
  const { user } = useAuth();
  
  const hasPlatformPermission = (permission: PlatformPermission): boolean => {
    if (!user || !user.platform_roles.length) return false;
    
    return user.platform_roles.some(role => 
      platformRolePermissions[role]?.includes(permission) ?? false
    );
  };

  const hasCustomerPermission = (permission: CustomerPermission): boolean => {
    if (!user || !user.customer_roles.length) return false;
    
    return user.customer_roles.some(role => 
      customerRolePermissions[role]?.includes(permission) ?? false
    );
  };
  
  const isPlatformOwner = (): boolean => {
    return user?.isPlatformOwner ?? false;
  };

  const isPlatformAdmin = (): boolean => {
    return user?.platform_roles.includes('platform_admin') ?? false;
  };

  const isCustomerAdmin = (): boolean => {
    return user?.customer_roles.includes('customer_admin') ?? false;
  };

  const canManageCustomers = (): boolean => {
    return hasPlatformPermission('customer:manage');
  };

  const canAssignRoles = (): boolean => {
    return hasPlatformPermission('user:assign_roles') || isCustomerAdmin();
  };
  
  return {
    hasPlatformPermission,
    hasCustomerPermission,
    isPlatformOwner,
    isPlatformAdmin,
    isCustomerAdmin,
    canManageCustomers,
    canAssignRoles,
    platformRoles: user?.platform_roles || [],
    customerRoles: user?.customer_roles || [],
    customer: user?.customer
  };
}
