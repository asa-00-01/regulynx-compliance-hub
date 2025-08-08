
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePlatformRoleAccess } from '@/hooks/permissions/usePlatformRoleAccess';
import LoadingScreen from './LoadingScreen';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import DashboardShell from '@/components/layout/DashboardShell';

// Import all page components
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Compliance from '@/pages/Compliance';
import ComplianceCases from '@/pages/ComplianceCases';
import CaseDetails from '@/pages/CaseDetails';
import UserCase from '@/pages/UserCase';
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
import Profile from '@/pages/Profile';
import AIAgent from '@/pages/AIAgent';
import News from '@/pages/News';
import Optimization from '@/pages/Optimization';
import DeveloperTools from '@/pages/DeveloperTools';
import PlatformManagement from '@/pages/PlatformManagement';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';

const AppRoutes = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes - all wrapped in DashboardShell */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardShell>
            <Dashboard />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/compliance" element={
        <ProtectedRoute>
          <DashboardShell>
            <Compliance />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/compliance-cases" element={
        <ProtectedRoute>
          <DashboardShell>
            <ComplianceCases />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/compliance-cases/:id" element={
        <ProtectedRoute>
          <DashboardShell>
            <CaseDetails />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/user-case/:userId" element={
        <ProtectedRoute>
          <DashboardShell>
            <UserCase />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/kyc-verification" element={
        <ProtectedRoute requiredRoles={['admin', 'complianceOfficer']}>
          <DashboardShell>
            <KYCVerification />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/transactions" element={
        <ProtectedRoute>
          <DashboardShell>
            <Transactions />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/documents" element={
        <ProtectedRoute>
          <DashboardShell>
            <Documents />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/aml-monitoring" element={
        <ProtectedRoute>
          <DashboardShell>
            <AMLMonitoring />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/risk-analysis" element={
        <ProtectedRoute>
          <DashboardShell>
            <RiskAnalysis />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/sar-center" element={
        <ProtectedRoute requiredRoles={['admin', 'complianceOfficer']}>
          <DashboardShell>
            <SARCenter />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/integration" element={
        <ProtectedRoute>
          <DashboardShell>
            <Integration />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <DashboardShell>
            <Analytics />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/audit-logs" element={
        <ProtectedRoute>
          <DashboardShell>
            <AuditLogs />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <DashboardShell>
            <Users />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardShell>
            <Profile />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/ai-agent" element={
        <ProtectedRoute>
          <DashboardShell>
            <AIAgent />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/news" element={
        <ProtectedRoute>
          <DashboardShell>
            <News />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/optimization" element={
        <ProtectedRoute>
          <DashboardShell>
            <Optimization />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/developer-tools" element={
        <ProtectedRoute>
          <DashboardShell>
            <DeveloperTools />
          </DashboardShell>
        </ProtectedRoute>
      } />
      
      <Route path="/platform-management" element={
        <ProtectedRoute>
          <DashboardShell>
            <PlatformManagement />
          </DashboardShell>
        </ProtectedRoute>
      } />

      {/* Catch all - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
