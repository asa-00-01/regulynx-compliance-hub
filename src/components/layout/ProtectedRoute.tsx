
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
  const { user, loading, isAuthenticated } = useAuth();
  const { loading: permissionsLoading } = useRoleBasedPermissions();

  // Show loading only while auth is being determined
  if (loading) {
    console.log('ProtectedRoute: Auth loading, showing spinner');
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
  if (requiresAuth && !isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // If authenticated, proceed to render children
  console.log('ProtectedRoute: Rendering children for authenticated user');
  return <>{children}</>;
};

export default ProtectedRoute;
