
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const DashboardLayout = ({ children, requiredRoles = [] }: DashboardLayoutProps) => {
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="h-full p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
