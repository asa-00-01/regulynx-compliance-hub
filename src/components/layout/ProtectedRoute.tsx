
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

  console.log('ProtectedRoute - authLoaded:', authLoaded, 'isAuthenticated:', isAuthenticated, 'user:', user, 'requiredRoles:', requiredRoles);

  // Show loading while auth is being determined
  if (!authLoaded) {
    console.log('ProtectedRoute - showing loading...');
    return (
      <LoadingWrapper isLoading={true}>
        <div></div>
      </LoadingWrapper>
    );
  }

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    console.log('ProtectedRoute - not authenticated, redirecting to auth...');
    return <Navigate to="/auth" replace />;
  }

  // If roles are required, check if user has necessary permissions
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = user && requiredRoles.includes(user.role);
    console.log('ProtectedRoute - checking roles. User role:', user?.role, 'Required roles:', requiredRoles, 'Has access:', hasRequiredRole);
    
    if (!hasRequiredRole) {
      console.log('ProtectedRoute - insufficient permissions, redirecting to unauthorized...');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('ProtectedRoute - rendering children...');
  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;
