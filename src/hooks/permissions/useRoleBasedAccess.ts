
import { useAuth } from '@/hooks/useAuth';

export type PlatformPermission = 
  | 'platform:admin'
  | 'platform:support'
  | 'system:monitor'
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'document:approve'
  | 'case:create'
  | 'case:update'
  | 'case:assign'
  | 'report:generate'
  | 'billing:view'
  | 'subscription:manage'
  | 'settings:admin';

export type CustomerPermission = 
  | 'customer:admin'
  | 'customer:compliance'
  | 'customer:executive'
  | 'customer:support';

export interface RolePermissions {
  hasPermission: (permission: PlatformPermission | CustomerPermission) => boolean;
  hasAnyPermission: (permissions: (PlatformPermission | CustomerPermission)[]) => boolean;
  hasAllPermissions: (permissions: (PlatformPermission | CustomerPermission)[]) => boolean;
  userPermissions: (PlatformPermission | CustomerPermission)[];
}

export function useRoleBasedAccess(): RolePermissions {
  const { user } = useAuth();

  const getUserPermissions = (): (PlatformPermission | CustomerPermission)[] => {
    if (!user) return [];
    
    // Mock permissions based on user role
    const role = user.role || 'customer:support';
    
    switch (role) {
      case 'platform_admin':
        return [
          'platform:admin',
          'platform:support',
          'system:monitor',
          'user:create',
          'user:update',
          'user:delete',
          'document:approve',
          'case:create',
          'case:update', 
          'case:assign',
          'report:generate',
          'billing:view',
          'subscription:manage',
          'settings:admin'
        ];
      case 'customer_admin':
        return [
          'customer:admin',
          'user:create',
          'user:update',
          'user:delete',
          'document:approve',
          'case:create',
          'case:update',
          'case:assign',
          'report:generate',
          'settings:admin'
        ];
      case 'customer_compliance':
        return [
          'customer:compliance',
          'document:approve',
          'case:create',
          'case:update',
          'case:assign',
          'report:generate'
        ];
      default:
        return ['customer:support'];
    }
  };

  const userPermissions = getUserPermissions();

  const hasPermission = (permission: PlatformPermission | CustomerPermission): boolean => {
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: (PlatformPermission | CustomerPermission)[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions: (PlatformPermission | CustomerPermission)[]): boolean => {
    return permissions.every(permission => userPermissions.includes(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions,
  };
}
