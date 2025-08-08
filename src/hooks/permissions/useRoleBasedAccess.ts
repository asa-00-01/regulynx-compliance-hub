
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { usePlatformRoleAccess } from './usePlatformRoleAccess';

type Permission = 
  | 'document:approve'
  | 'document:view'
  | 'case:create'
  | 'case:assign'
  | 'case:update'
  | 'case:view'
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'user:view'
  | 'report:generate'
  | 'report:view'
  | 'subscription:manage'
  | 'billing:view'
  | 'settings:admin';

const legacyRolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'document:approve', 'document:view',
    'case:create', 'case:assign', 'case:update', 'case:view',
    'user:create', 'user:update', 'user:delete', 'user:view',
    'report:generate', 'report:view',
    'subscription:manage', 'billing:view', 'settings:admin'
  ],
  complianceOfficer: [
    'document:approve', 'document:view',
    'case:create', 'case:assign', 'case:update', 'case:view',
    'report:generate', 'report:view',
    'billing:view'
  ],
  executive: [
    'document:view',
    'case:view',
    'user:view',
    'report:view',
    'billing:view'
  ],
  support: [
    'document:view',
    'case:view'
  ]
};

export function useRoleBasedAccess() {
  const { user } = useAuth();
  const platformAccess = usePlatformRoleAccess();
  
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    // Check platform-based permissions first
    if (platformAccess.isPlatformOwner()) {
      // Platform owners have elevated permissions
      if (platformAccess.isPlatformAdmin()) {
        return true; // Platform admins have all permissions
      }
    }
    
    // Map new customer roles to legacy permissions
    const customerRolePermissions = user.customer_roles.some(role => {
      switch (role) {
        case 'customer_admin':
          return legacyRolePermissions.admin.includes(permission);
        case 'customer_compliance':
          return legacyRolePermissions.complianceOfficer.includes(permission);
        case 'customer_executive':
          return legacyRolePermissions.executive.includes(permission);
        case 'customer_support':
          return legacyRolePermissions.support.includes(permission);
        default:
          return false;
      }
    });

    if (customerRolePermissions) return true;
    
    // Fallback to legacy role system for backward compatibility
    return legacyRolePermissions[user.role]?.includes(permission) ?? false;
  };
  
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole: user?.role || 'support',
    
    // Expose platform access methods
    ...platformAccess
  };
}
