
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, authLoaded, session } = useAuth();

  console.log('ProtectedRoute check:', { 
    authLoaded, 
    isAuthenticated, 
    user: !!user, 
    session: !!session,
    userRole: user?.role,
    requiredRoles 
  });

  // Show loading while auth is being determined
  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading authentication...</div>
      </div>
    );
  }

  // If not authenticated (no session), redirect to login
  if (!session) {
    console.log('No session found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If we have a session but no user profile yet, show loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading user profile...</div>
      </div>
    );
  }

  // If roles are required, check if user has necessary permissions
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = user && requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      console.log('User does not have required role:', { userRole: user.role, requiredRoles });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
