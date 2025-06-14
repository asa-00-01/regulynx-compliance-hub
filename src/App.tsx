
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ComplianceProvider } from './context/ComplianceContext';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from './components/common/ErrorBoundary';
import './App.css';

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const AMLMonitoring = React.lazy(() => import('./pages/AMLMonitoring'));
const KYCVerification = React.lazy(() => import('./pages/KYCVerification'));
const Documents = React.lazy(() => import('./pages/Documents'));
const ComplianceCases = React.lazy(() => import('./pages/ComplianceCases'));
const SARCenter = React.lazy(() => import('./pages/SARCenter'));
const Unauthorized = React.lazy(() => import('./pages/Unauthorized'));
const Compliance = React.lazy(() => import('./pages/Compliance'));
const UserCase = React.lazy(() => import('./pages/UserCase'));
const AuditLogs = React.lazy(() => import('./pages/AuditLogs'));
const RiskAnalysis = React.lazy(() => import('./pages/RiskAnalysis'));
const Transactions = React.lazy(() => import('./pages/Transactions'));
const ProtectedRoute = React.lazy(() => import('./components/layout/ProtectedRoute'));

const AppLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-pulse text-lg font-medium">Loading ReguLynx...</div>
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  </div>
);

function App() {
  console.log('App component rendering...');
  
  return (
    <ErrorBoundary>
      <ComplianceProvider>
        <div className="min-h-screen bg-background">
          <Suspense fallback={<AppLoadingFallback />}>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/aml-monitoring"
                element={
                  <ProtectedRoute requiredRoles={['complianceOfficer', 'admin']}>
                    <AMLMonitoring />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kyc-verification"
                element={
                  <ProtectedRoute requiredRoles={['complianceOfficer', 'admin']}>
                    <KYCVerification />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <ProtectedRoute requiredRoles={['complianceOfficer', 'admin', 'support']}>
                    <Documents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/compliance-cases"
                element={
                  <ProtectedRoute requiredRoles={['complianceOfficer', 'admin', 'executive']}>
                    <ComplianceCases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sar-center"
                element={
                  <ProtectedRoute requiredRoles={['complianceOfficer', 'admin']}>
                    <SARCenter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/compliance"
                element={
                  <ProtectedRoute requiredRoles={['complianceOfficer', 'admin', 'executive']}>
                    <Compliance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-case/:userId"
                element={
                  <ProtectedRoute requiredRoles={['complianceOfficer', 'admin']}>
                    <UserCase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-case"
                element={
                  <ProtectedRoute requiredRoles={['complianceOfficer', 'admin']}>
                    <UserCase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute requiredRoles={['complianceOfficer', 'admin']}>
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/risk-analysis"
                element={
                  <ProtectedRoute requiredRoles={['complianceOfficer', 'admin', 'executive']}>
                    <RiskAnalysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute requiredRoles={['complianceOfficer', 'admin', 'executive']}>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
        </div>
      </ComplianceProvider>
    </ErrorBoundary>
  );
}

export default App;
