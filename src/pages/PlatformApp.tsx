
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePlatformRoleAccess } from '@/hooks/permissions/usePlatformRoleAccess';
import LoadingScreen from '@/components/app/LoadingScreen';
import PlatformDashboard from '@/components/platform/PlatformDashboard';
import PlatformManagement from '@/pages/PlatformManagement';
import PlatformUserManagement from '@/components/platform/PlatformUserManagement';
import PlatformSystemHealth from '@/components/platform/PlatformSystemHealth';
import PlatformBilling from '@/components/platform/PlatformBilling';
import PlatformSettings from '@/components/platform/PlatformSettings';
import DeveloperTools from '@/pages/DeveloperTools';
import Unauthorized from '@/pages/Unauthorized';

const PlatformApp: React.FC = () => {
  const { loading, authLoaded } = useAuth();
  const { isPlatformOwner, isPlatformAdmin, hasPlatformPermission } = usePlatformRoleAccess();

  if (loading || !authLoaded) {
    return <LoadingScreen text="Loading platform..." />;
  }

  // Check if user has platform access
  if (!isPlatformOwner() && !isPlatformAdmin() && !hasPlatformPermission('platform:support')) {
    return <Unauthorized />;
  }

  // Note: PlatformLayout is now handled by ManagementLayout wrapper
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/platform/dashboard" replace />} />
      <Route path="/dashboard" element={<PlatformDashboard />} />
      <Route path="/management" element={<PlatformManagement />} />
      <Route path="/users" element={<PlatformUserManagement />} />
      <Route path="/system-health" element={<PlatformSystemHealth />} />
      <Route path="/billing" element={<PlatformBilling />} />
      <Route path="/settings" element={<PlatformSettings />} />
      <Route path="/developer-tools" element={<DeveloperTools />} />
      <Route path="*" element={<Navigate to="/platform/dashboard" replace />} />
    </Routes>
  );
};

export default PlatformApp;
