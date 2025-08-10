
import React from 'react';
import { usePlatformRoleAccess } from '@/hooks/permissions/usePlatformRoleAccess';
import { Navigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

interface DashboardShellProps {
  children: React.ReactNode;
}

const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const { isPlatformOwner, isPlatformAdmin, hasPlatformPermission } = usePlatformRoleAccess();
  
  // Redirect platform users to platform app
  const shouldUsePlatformApp = isPlatformOwner() || isPlatformAdmin() || hasPlatformPermission('platform:support');
  
  if (shouldUsePlatformApp) {
    return <Navigate to="/platform/dashboard" replace />;
  }

  // This shell is now specifically for customer users
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

export default DashboardShell;
