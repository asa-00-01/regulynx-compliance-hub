
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePlatformRoleAccess } from '@/hooks/permissions/usePlatformRoleAccess';
import LoadingScreen from './LoadingScreen';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import CustomerLayout from '@/components/layouts/CustomerLayout';
import ManagementLayout from '@/components/layouts/ManagementLayout';

// Import platform app
import PlatformApp from '@/pages/PlatformApp';

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
import Pricing from '@/pages/Pricing';
import SubscriptionSuccess from '@/pages/SubscriptionSuccess';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';

const AppRoutes = () => {
  const { loading, authLoaded, user } = useAuth();
  const { isPlatformOwner, isPlatformAdmin, hasPlatformPermission } = usePlatformRoleAccess();

  // Show loading screen while auth is being determined
  if (loading || !authLoaded) {
    console.log('🔄 AppRoutes - Auth loading...', { loading, authLoaded });
    return <LoadingScreen text="Loading application..." />;
  }

  console.log('✅ AppRoutes - Auth loaded, rendering routes');

  // Check if user should be redirected to platform app
  const shouldUsePlatformApp = user && (isPlatformOwner() || isPlatformAdmin() || hasPlatformPermission('platform:support'));

  console.log('🔍 AppRoutes - Platform check:', {
    user: user?.email,
    isPlatformOwner: isPlatformOwner(),
    isPlatformAdmin: isPlatformAdmin(),
    hasPlatformPermission: hasPlatformPermission('platform:support'),
    shouldUsePlatformApp
  });

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/subscription-success" element={<SubscriptionSuccess />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Platform Management Routes - Only for platform users */}
      {shouldUsePlatformApp ? (
        <>
          {/* Redirect customer routes to platform for platform users */}
          <Route path="/dashboard" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/compliance" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/compliance-cases" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/compliance-cases/:id" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/user-case/:userId" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/kyc-verification" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/transactions" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/documents" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/aml-monitoring" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/risk-analysis" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/sar-center" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/integration" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/analytics" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/audit-logs" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/users" element={<Navigate to="/platform/users" replace />} />
          <Route path="/profile" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/ai-agent" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/news" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/optimization" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="/developer-tools" element={<Navigate to="/platform/developer-tools" replace />} />
          
          {/* Platform Management Routes using ManagementLayout */}
          <Route path="/platform/*" element={
            <ProtectedRoute>
              <ManagementLayout>
                <PlatformApp />
              </ManagementLayout>
            </ProtectedRoute>
          } />
        </>
      ) : (
        /* Customer Routes using CustomerLayout */
        <>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Dashboard />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/compliance" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Compliance />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/compliance-cases" element={
            <ProtectedRoute>
              <CustomerLayout>
                <ComplianceCases />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/compliance-cases/:id" element={
            <ProtectedRoute>
              <CustomerLayout>
                <CaseDetails />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/user-case/:userId" element={
            <ProtectedRoute>
              <CustomerLayout>
                <UserCase />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/kyc-verification" element={
            <ProtectedRoute>
              <CustomerLayout requiredRoles={['admin', 'complianceOfficer'] as const}>
                <KYCVerification />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/transactions" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Transactions />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/documents" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Documents />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/aml-monitoring" element={
            <ProtectedRoute>
              <CustomerLayout>
                <AMLMonitoring />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/risk-analysis" element={
            <ProtectedRoute>
              <CustomerLayout>
                <RiskAnalysis />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/sar-center" element={
            <ProtectedRoute>
              <CustomerLayout requiredRoles={['admin', 'complianceOfficer'] as const}>
                <SARCenter />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/integration" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Integration />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Analytics />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/audit-logs" element={
            <ProtectedRoute>
              <CustomerLayout>
                <AuditLogs />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute>
              <CustomerLayout requiredRoles={['admin'] as const}>
                <Users />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Profile />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ai-agent" element={
            <ProtectedRoute>
              <CustomerLayout>
                <AIAgent />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/news" element={
            <ProtectedRoute>
              <CustomerLayout>
                <News />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/optimization" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Optimization />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/developer-tools" element={
            <ProtectedRoute>
              <CustomerLayout>
                <DeveloperTools />
              </CustomerLayout>
            </ProtectedRoute>
          } />

          {/* Redirect to unauthorized if platform routes are accessed by non-platform users */}
          <Route path="/platform/*" element={<Navigate to="/unauthorized" replace />} />
        </>
      )}

      {/* Catch all - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
