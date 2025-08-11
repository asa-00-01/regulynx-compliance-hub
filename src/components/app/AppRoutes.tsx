
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePlatformRoleAccess } from '@/hooks/permissions/usePlatformRoleAccess';
import LoadingScreen from '@/components/app/LoadingScreen';

// Platform App (completely separate from customer app)
import PlatformApp from '@/pages/PlatformApp';

// Customer App Components
import DashboardShell from '@/components/layout/DashboardShell';
import Dashboard from '@/pages/Dashboard';
import Compliance from '@/pages/Compliance';
import ComplianceCases from '@/pages/ComplianceCases';
import KYCVerification from '@/pages/KYCVerification';
import Transactions from '@/pages/Transactions';
import Documents from '@/pages/Documents';
import AMLMonitoring from '@/pages/AMLMonitoring';
import RiskAnalysis from '@/pages/RiskAnalysis';
import SARCenter from '@/pages/SARCenter';
import Integration from '@/pages/Integration';
import Analytics from '@/pages/Analytics';
import AuditLogs from '@/pages/AuditLogs';
import Users from '@/pages/Users';
import AIAgent from '@/pages/AIAgent';
import News from '@/pages/News';
import Optimization from '@/pages/Optimization';
import DeveloperTools from '@/pages/DeveloperTools';
import PlatformManagement from '@/pages/PlatformManagement';
import Pricing from '@/pages/Pricing';
import Profile from '@/pages/Profile';
import AuthPage from '@/pages/AuthPage';
import Unauthorized from '@/pages/Unauthorized';

const AppRoutes = () => {
  const { loading, authLoaded } = useAuth();
  const { isPlatformOwner, isPlatformAdmin, hasPlatformPermission } = usePlatformRoleAccess();

  if (loading || !authLoaded) {
    return <LoadingScreen />;
  }

  // Check if user should use platform app
  const shouldUsePlatformApp = isPlatformOwner() || isPlatformAdmin() || hasPlatformPermission('platform:support');

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Platform Routes - Completely separate from customer app */}
      {shouldUsePlatformApp && (
        <Route path="/platform/*" element={<PlatformApp />} />
      )}
      
      {/* Customer App Routes - Only for non-platform users */}
      {!shouldUsePlatformApp && (
        <>
          <Route path="/dashboard" element={<DashboardShell><Dashboard /></DashboardShell>} />
          <Route path="/compliance" element={<DashboardShell><Compliance /></DashboardShell>} />
          <Route path="/compliance-cases" element={<DashboardShell><ComplianceCases /></DashboardShell>} />
          <Route path="/kyc-verification" element={<DashboardShell><KYCVerification /></DashboardShell>} />
          <Route path="/transactions" element={<DashboardShell><Transactions /></DashboardShell>} />
          <Route path="/documents" element={<DashboardShell><Documents /></DashboardShell>} />
          <Route path="/aml-monitoring" element={<DashboardShell><AMLMonitoring /></DashboardShell>} />
          <Route path="/risk-analysis" element={<DashboardShell><RiskAnalysis /></DashboardShell>} />
          <Route path="/sar-center" element={<DashboardShell><SARCenter /></DashboardShell>} />
          <Route path="/integration" element={<DashboardShell><Integration /></DashboardShell>} />
          <Route path="/analytics" element={<DashboardShell><Analytics /></DashboardShell>} />
          <Route path="/audit-logs" element={<DashboardShell><AuditLogs /></DashboardShell>} />
          <Route path="/users" element={<DashboardShell><Users /></DashboardShell>} />
          <Route path="/ai-agent" element={<DashboardShell><AIAgent /></DashboardShell>} />
          <Route path="/news" element={<DashboardShell><News /></DashboardShell>} />
          <Route path="/optimization" element={<DashboardShell><Optimization /></DashboardShell>} />
          <Route path="/developer-tools" element={<DashboardShell><DeveloperTools /></DashboardShell>} />
          <Route path="/platform-management" element={<DashboardShell><PlatformManagement /></DashboardShell>} />
          <Route path="/pricing" element={<DashboardShell><Pricing /></DashboardShell>} />
          <Route path="/profile" element={<DashboardShell><Profile /></DashboardShell>} />
        </>
      )}
      
      {/* Redirects based on user type */}
      <Route 
        path="/" 
        element={
          shouldUsePlatformApp ? 
            <Navigate to="/platform/dashboard" replace /> : 
            <Navigate to="/dashboard" replace />
        } 
      />
      
      {/* Catch all - redirect based on user type */}
      <Route 
        path="*" 
        element={
          shouldUsePlatformApp ? 
            <Navigate to="/platform/dashboard" replace /> : 
            <Navigate to="/dashboard" replace />
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
