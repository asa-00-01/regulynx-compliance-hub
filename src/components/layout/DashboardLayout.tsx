
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

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, navigate, canAccess, requiredRoles]);

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <>
      <ShadcnSidebar collapsible="icon">
        <LayoutSidebar />
      </ShadcnSidebar>
      <div className="flex flex-col flex-1 min-w-0">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="h-full p-6">{children}</div>
        </main>
      </div>
    </>
  );
};

const DashboardLayout = (props: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen bg-background overflow-hidden">
        <DashboardLayoutContent {...props} />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
