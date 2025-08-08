
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/app/LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, authLoaded, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', { 
    loading, 
    authLoaded, 
    isAuthenticated, 
    userEmail: user?.email,
    requiredRoles,
    currentPath: location.pathname
  });

  // Show loading while auth is being determined
  if (loading || !authLoaded) {
    return <LoadingScreen text="Verifying access..." />;
  }

  // If not authenticated, redirect to login page with return URL
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are required, check if user has necessary permissions
  if (requiredRoles && requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      console.log('❌ ProtectedRoute - Insufficient permissions', { 
        userRole: user.role, 
        requiredRoles 
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('✅ ProtectedRoute - Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
