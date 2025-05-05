
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
  | 'report:view';

// Role-based permission mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'document:approve', 'document:view',
    'case:create', 'case:assign', 'case:update', 'case:view',
    'user:create', 'user:update', 'user:delete', 'user:view',
    'report:generate', 'report:view'
  ],
  complianceOfficer: [
    'document:approve', 'document:view',
    'case:create', 'case:assign', 'case:update', 'case:view',
    'report:generate', 'report:view'
  ],
  executive: [
    'document:view',
    'case:view',
    'user:view',
    'report:view'
  ],
  support: [
    'document:view',
    'case:view'
  ]
};

export function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    const userRole = user.role;
    return rolePermissions[userRole]?.includes(permission) ?? false;
  };
  
  const canApproveDocuments = (): boolean => {
    return hasPermission('document:approve');
  };
  
  const canManageUsers = (): boolean => {
    return hasPermission('user:create') && 
           hasPermission('user:update') && 
           hasPermission('user:delete');
  };
  
  const canManageCases = (): boolean => {
    return hasPermission('case:create') && 
           hasPermission('case:update') && 
           hasPermission('case:assign');
  };
  
  const canGenerateReports = (): boolean => {
    return hasPermission('report:generate');
  };
  
  return {
    hasPermission,
    canApproveDocuments,
    canManageUsers,
    canManageCases,
    canGenerateReports,
  };
}
