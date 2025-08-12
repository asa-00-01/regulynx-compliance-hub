
import React from 'react';
import { usePlatformRoleAccess } from '@/hooks/permissions/usePlatformRoleAccess';
import { Navigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

interface DashboardShellProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const DashboardShell: React.FC<DashboardShellProps> = ({ children, requiredRoles }) => {
  const { isPlatformOwner, isPlatformAdmin, hasPlatformPermission } = usePlatformRoleAccess();
  
  // This should not happen due to routing logic, but double-check
  const shouldUsePlatformApp = isPlatformOwner() || isPlatformAdmin() || hasPlatformPermission('platform:support');
  
  if (shouldUsePlatformApp) {
    console.log('🔄 DashboardShell - Redirecting platform user to platform app');
    return <Navigate to="/platform/dashboard" replace />;
  }

  // For customer users, provide the dashboard layout
  return (
    <DashboardLayout requiredRoles={requiredRoles}>
      {children}
    </DashboardLayout>
  );
};

export default DashboardShell;
