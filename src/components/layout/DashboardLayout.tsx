
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LayoutSidebar from './Sidebar';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { SidebarProvider, useSidebar, Sidebar as ShadcnSidebar } from '@/components/ui/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const DashboardLayoutContent = ({ children, requiredRoles = [] }: DashboardLayoutProps) => {
  const { isAuthenticated, canAccess } = useAuth();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();

  const sidebarOpen = state === 'expanded';

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
    <div className="flex h-screen w-full overflow-hidden">
      <ShadcnSidebar collapsible="icon" className="border-r">
        <LayoutSidebar />
      </ShadcnSidebar>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const DashboardLayout = (props: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <DashboardLayoutContent {...props} />
    </SidebarProvider>
  );
};

export default DashboardLayout;
