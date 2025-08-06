
import { useRoleBasedAccess } from './useRoleBasedAccess';

export function useFeatureAccess() {
  const { hasPermission, hasAnyPermission } = useRoleBasedAccess();
  
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

  const canAccessBilling = (): boolean => {
    return hasAnyPermission(['billing:view', 'subscription:manage']);
  };

  const canManageSubscription = (): boolean => {
    return hasPermission('subscription:manage');
  };

  const canAccessSettings = (): boolean => {
    return hasPermission('settings:admin');
  };
  
  return {
    canApproveDocuments,
    canManageUsers,
    canManageCases,
    canGenerateReports,
    canAccessBilling,
    canManageSubscription,
    canAccessSettings
  };
}
