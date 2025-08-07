
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DashboardLayout;
