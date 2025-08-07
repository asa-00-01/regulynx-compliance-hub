
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';

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
        <div className="animate-pulse">Loading...</div>
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
