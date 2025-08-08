
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

      {/* Protected routes - wrapped in DashboardShell */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardShell />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="compliance-cases" element={<ComplianceCases />} />
        <Route path="compliance-cases/:id" element={<CaseDetails />} />
        <Route path="user-case/:userId" element={<UserCase />} />
        <Route path="kyc-verification" element={
          <ProtectedRoute requiredRoles={['admin', 'complianceOfficer']}>
            <KYCVerification />
          </ProtectedRoute>
        } />
        <Route path="transactions" element={<Transactions />} />
        <Route path="documents" element={<Documents />} />
        <Route path="aml-monitoring" element={<AMLMonitoring />} />
        <Route path="risk-analysis" element={<RiskAnalysis />} />
        <Route path="sar-center" element={
          <ProtectedRoute requiredRoles={['admin', 'complianceOfficer']}>
            <SARCenter />
          </ProtectedRoute>
        } />
        <Route path="integration" element={<Integration />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="users" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="profile" element={<Profile />} />
        <Route path="ai-agent" element={<AIAgent />} />
        <Route path="news" element={<News />} />
        <Route path="optimization" element={<Optimization />} />
        <Route path="developer-tools" element={<DeveloperTools />} />
        <Route path="platform-management" element={<PlatformManagement />} />
      </Route>

      {/* Redirect legacy routes */}
      <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
      
      {/* Catch all - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
