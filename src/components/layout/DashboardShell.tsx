
import React from 'react';
import DashboardLayout from './DashboardLayout';

interface DashboardShellProps {
  children: React.ReactNode;
}

const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  // This shell is now specifically for customer users only
  // Platform users are routed to PlatformApp before reaching here
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

export default DashboardShell;
