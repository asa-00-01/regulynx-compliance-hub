
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LayoutSidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { SidebarProvider, SidebarInset, Sidebar as ShadcnSidebar } from '@/components/ui/sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const DashboardLayoutContent = ({ children, requiredRoles = [] }: DashboardLayoutProps) => {
  const { isAuthenticated, canAccess } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, navigate, canAccess, requiredRoles]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ShadcnSidebar collapsible="icon" className="border-r">
          <LayoutSidebar />
        </ShadcnSidebar>
        <SidebarInset className="flex-1">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            <div className="container mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const DashboardLayout = (props: DashboardLayoutProps) => {
  return <DashboardLayoutContent {...props} />;
};

export default DashboardLayout;
