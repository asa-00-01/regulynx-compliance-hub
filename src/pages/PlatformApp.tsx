
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
import Integration from '@/pages/Integration';
import DeveloperTools from '@/pages/DeveloperTools';
import Unauthorized from '@/pages/Unauthorized';

// Import new comprehensive console components
import PlatformConsole from '@/components/platform/PlatformConsole';
import CustomerManagementConsole from '@/components/platform/CustomerManagementConsole';
import BillingManagementConsole from '@/components/platform/BillingManagementConsole';
import SecurityComplianceConsole from '@/components/platform/SecurityComplianceConsole';
import AnalyticsReportingConsole from '@/components/platform/AnalyticsReportingConsole';

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
      
      {/* Main Platform Console */}
      <Route path="/dashboard" element={<PlatformConsole />} />
      
      {/* Customer Management */}
      <Route path="/management" element={<CustomerManagementConsole />} />
      
      {/* User Management */}
      <Route path="/users" element={<PlatformUserManagement />} />
      
      {/* System Health */}
      <Route path="/system-health" element={<PlatformSystemHealth />} />
      
      {/* Billing & Revenue */}
      <Route path="/billing" element={<BillingManagementConsole />} />
      
      {/* Security & Compliance */}
      <Route path="/security" element={<SecurityComplianceConsole />} />
      
      {/* Analytics & Reporting */}
      <Route path="/analytics" element={<AnalyticsReportingConsole />} />
      
      {/* Settings */}
      <Route path="/settings" element={<PlatformSettings />} />
      
      {/* Integration */}
      <Route path="/integration" element={<Integration />} />
      
      {/* Developer Tools */}
      <Route path="/developer-tools" element={<DeveloperTools />} />
      
      {/* Legacy routes for backward compatibility */}
      <Route path="/legacy-dashboard" element={<PlatformDashboard />} />
      <Route path="/legacy-management" element={<PlatformManagement />} />
      <Route path="/legacy-billing" element={<PlatformBilling />} />
      
      <Route path="*" element={<Navigate to="/platform/dashboard" replace />} />
    </Routes>
  );
};

export default PlatformApp;
