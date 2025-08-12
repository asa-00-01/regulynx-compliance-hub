
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { isManagementRole } from '@/lib/auth/roles';
import DashboardShell from '@/components/layout/DashboardShell';

interface ManagementLayoutProps {
  children: React.ReactNode;
}

const ManagementLayout: React.FC<ManagementLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  // Check if user has management role access
  if (!user || !isManagementRole(user.role as any)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the management area.</p>
        </div>
      </div>
    );
  }

  // DashboardShell provides its own header + left nav internally
  return (
    <div data-testid="shell-root">
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
};

export default ManagementLayout;
