
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AnalyticsDashboard from './AnalyticsDashboard';
import DeveloperPanel from '../dev/DeveloperPanel';
import PerformanceDashboard from './PerformanceDashboard';
import ProductionReadinessChecker from './ProductionReadinessChecker';
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
      <AnalyticsDashboard />
      <DeveloperPanel />
      <PerformanceDashboard />
      <ProductionReadinessChecker />
      <SystemHealthMonitor />
      <OptimizationCenter />
      <SecurityMonitor />
      <SecurityAuditLog />
    </>
  );
};

export default AdminOnlyDevTools;
