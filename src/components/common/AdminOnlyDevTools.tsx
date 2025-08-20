
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { config } from '@/config/environment';
import DeveloperPanel from '../dev/DeveloperPanel';
import SystemHealthMonitor from './SystemHealthMonitor';
import OptimizationCenter from './OptimizationCenter';
import SecurityMonitor from '../security/SecurityMonitor';
import SecurityAuditLog from '../security/SecurityAuditLog';

const AdminOnlyDevTools: React.FC = () => {
  const { user } = useAuth();
  
  // Check both role and feature flag for developer tools access
  if (!user?.platform_roles?.includes('platform_admin') || !config.features.enableDevTools) {
    return null;
  }

  return (
    <>
      <DeveloperPanel />
      <SystemHealthMonitor />
      <OptimizationCenter />
      <SecurityMonitor />
      <SecurityAuditLog />
    </>
  );
};

export default AdminOnlyDevTools;
