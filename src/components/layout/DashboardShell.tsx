
import React from 'react';
import { usePlatformRoleAccess } from '@/hooks/permissions/usePlatformRoleAccess';
import { Navigate } from 'react-router-dom';

interface DashboardShellProps {
  children: React.ReactNode;
}

const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const { isPlatformOwner, isPlatformAdmin, hasPlatformPermission } = usePlatformRoleAccess();
  
  // This should not happen due to routing logic, but double-check
  const shouldUsePlatformApp = isPlatformOwner() || isPlatformAdmin() || hasPlatformPermission('platform:support');
  
  if (shouldUsePlatformApp) {
    console.log('🔄 DashboardShell - Redirecting platform user to platform app');
    return <Navigate to="/platform/dashboard" replace />;
  }

  // This shell is specifically for customer users only - just render children without additional layout
  return <>{children}</>;
};

export default DashboardShell;
