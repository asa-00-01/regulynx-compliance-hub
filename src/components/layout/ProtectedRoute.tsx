
import React, { ReactNode, memo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import LoadingWrapper from '../common/LoadingWrapper';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute = memo(({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, authLoaded } = useAuth();

  // Show loading while auth is being determined
  if (!authLoaded) {
    return (
      <LoadingWrapper isLoading={true}>
        <div></div>
      </LoadingWrapper>
    );
  }

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If roles are required, check if user has necessary permissions
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = user && requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;
