
import React from 'react';
import PlatformLayout from '@/components/platform/PlatformLayout';

interface ManagementLayoutProps {
  children: React.ReactNode;
}

const ManagementLayout: React.FC<ManagementLayoutProps> = ({ children }) => {
  // PlatformLayout already includes its own header and navigation
  // so we just wrap children in it
  return <PlatformLayout>{children}</PlatformLayout>;
};

export default ManagementLayout;
