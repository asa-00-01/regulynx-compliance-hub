
import React from 'react';
import { useAuth } from '@/context/RefactoredAuthContext';
import CustomerSidebar from './CustomerSidebar';
import PlatformSidebar from './PlatformSidebar';

const Sidebar = () => {
  const { isPlatformUser, isCustomerUser } = useAuth();

  // Platform users get the platform management interface
  if (isPlatformUser) {
    return <PlatformSidebar />;
  }

  // Customer users get the AML compliance interface
  if (isCustomerUser) {
    return <CustomerSidebar />;
  }

  // Fallback to customer sidebar for unauthenticated users
  return <CustomerSidebar />;
};

export default Sidebar;
