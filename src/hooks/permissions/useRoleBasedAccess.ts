
import { useAuth } from '@/context/AuthContext';

export type PlatformPermission = 'admin:read' | 'admin:write' | 'system:manage';
export type CustomerPermission = 'cases:read' | 'cases:write' | 'users:read' | 'users:write';
export type UserRole = 'admin' | 'complianceOfficer' | 'executive' | 'support';

export interface RolePermissions {
  hasPlatformPermission: (permission: PlatformPermission) => boolean;
  hasCustomerPermission: (permission: CustomerPermission) => boolean;
  canAccessRoute: (route: string) => boolean;
  canPerformAction: (action: string) => boolean;
  isAdmin: boolean;
  isComplianceOfficer: boolean;
  isExecutive: boolean;
  isSupport: boolean;
  userRole: UserRole;
  hasPermission: (permission: PlatformPermission | CustomerPermission) => boolean;
  canRead: (resource: string) => boolean;
  canWrite: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
}

const rolePermissions: Record<UserRole, (PlatformPermission | CustomerPermission)[]> = {
  admin: ['admin:read', 'admin:write', 'system:manage', 'cases:read', 'cases:write', 'users:read', 'users:write'],
  complianceOfficer: ['cases:read', 'cases:write', 'users:read'],
  executive: ['cases:read', 'users:read'],
  support: ['cases:read']
};

export const useRoleBasedAccess = (): RolePermissions => {
  const { user } = useAuth();
  const userRole = (user?.role as UserRole) || 'support';
  const permissions = rolePermissions[userRole] || [];

  const hasPlatformPermission = (permission: PlatformPermission): boolean => {
    return permissions.includes(permission);
  };

  const hasCustomerPermission = (permission: CustomerPermission): boolean => {
    return permissions.includes(permission);
  };

  const hasPermission = (permission: PlatformPermission | CustomerPermission): boolean => {
    return permissions.includes(permission);
  };

  const canAccessRoute = (route: string): boolean => {
    const routePermissions: Record<string, (PlatformPermission | CustomerPermission)[]> = {
      '/admin': ['admin:read'],
      '/users': ['users:read'],
      '/cases': ['cases:read']
    };
    
    const requiredPermissions = routePermissions[route] || [];
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  const canPerformAction = (action: string): boolean => {
    const actionPermissions: Record<string, (PlatformPermission | CustomerPermission)[]> = {
      'create_case': ['cases:write'],
      'edit_user': ['users:write'],
      'delete_case': ['cases:write']
    };
    
    const requiredPermissions = actionPermissions[action] || [];
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  const canRead = (resource: string): boolean => {
    return hasPermission(`${resource}:read` as any);
  };

  const canWrite = (resource: string): boolean => {
    return hasPermission(`${resource}:write` as any);
  };

  const canDelete = (resource: string): boolean => {
    return hasPermission(`${resource}:write` as any);
  };

  return {
    hasPlatformPermission,
    hasCustomerPermission,
    hasPermission,
    canAccessRoute,
    canPerformAction,
    canRead,
    canWrite,
    canDelete,
    isAdmin: userRole === 'admin',
    isComplianceOfficer: userRole === 'complianceOfficer',
    isExecutive: userRole === 'executive',
    isSupport: userRole === 'support',
    userRole
  };
};
