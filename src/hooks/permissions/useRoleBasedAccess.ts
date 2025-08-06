
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

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

const rolePermissions: Record<UserRole, Permission[]> = {
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
  
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return rolePermissions[user.role]?.includes(permission) ?? false;
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
    userRole: user?.role || 'support'
  };
}
