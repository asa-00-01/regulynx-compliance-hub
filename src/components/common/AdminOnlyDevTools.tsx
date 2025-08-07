
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import DeveloperPanel from '../dev/DeveloperPanel';
import SystemHealthMonitor from './SystemHealthMonitor';
import OptimizationCenter from './OptimizationCenter';
import SecurityMonitor from '../security/SecurityMonitor';
import SecurityAuditLog from '../security/SecurityAuditLog';

const AdminOnlyDevTools: React.FC = () => {
  const { user } = useAuth();
  
  // Only show developer tools to admin users
  if (user?.role !== 'admin') {
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
