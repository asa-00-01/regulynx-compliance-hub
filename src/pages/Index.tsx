
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePlatformRoleAccess } from '@/hooks/permissions/usePlatformRoleAccess';
import LoadingScreen from '@/components/app/LoadingScreen';

const Index = () => {
  const { isAuthenticated, loading, authLoaded } = useAuth();
  const { isPlatformOwner, isPlatformAdmin, hasPlatformPermission } = usePlatformRoleAccess();

  if (loading || !authLoaded) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Determine which app to redirect to based on user type
  const shouldUsePlatformApp = isPlatformOwner() || isPlatformAdmin() || hasPlatformPermission('platform:support');

  if (shouldUsePlatformApp) {
    return <Navigate to="/platform/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default Index;
