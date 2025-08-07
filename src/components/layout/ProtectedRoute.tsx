
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/auth/AuthContext';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiresAuth?: boolean;
}

const ProtectedRoute = ({ children, requiresAuth = true }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { loading: permissionsLoading } = useRoleBasedPermissions();

  // Show loading while auth is being determined
  if (loading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated and auth is required, redirect to auth page
  if (requiresAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
