
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PlatformDashboard from '@/components/platform/PlatformDashboard';
import PlatformUserManagement from '@/components/platform/PlatformUserManagement';
import PlatformSystemHealth from '@/components/platform/PlatformSystemHealth';
import PlatformBilling from '@/components/platform/PlatformBilling';
import PlatformSettings from '@/components/platform/PlatformSettings';
import DeveloperTools from '@/pages/DeveloperTools';

const PlatformApp: React.FC = () => {
  // Layout is now handled by ManagementLayout wrapper
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/platform/dashboard" replace />} />
      <Route path="/dashboard" element={<PlatformDashboard />} />
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
