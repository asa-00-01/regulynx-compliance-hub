
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import ComplianceCases from '@/pages/ComplianceCases';
import CaseDetails from '@/pages/CaseDetails';
import Documents from '@/pages/Documents';
import Users from '@/pages/Users';
import Settings from '@/pages/Settings';
import Audits from '@/pages/Audits';
import Pricing from '@/pages/Pricing';
import SubscriptionSuccess from '@/pages/SubscriptionSuccess';
import Transactions from '@/pages/Transactions';
import RiskAnalysis from '@/pages/RiskAnalysis';
import SARCenter from '@/pages/SARCenter';
import AuditLogs from '@/pages/AuditLogs';
import Compliance from '@/pages/Compliance';
import AMLMonitoring from '@/pages/AMLMonitoring';
import KYCVerification from '@/pages/KYCVerification';
import UserCase from '@/pages/UserCase';
import AIAgent from '@/pages/AIAgent';
import News from '@/pages/News';
import Optimization from '@/pages/Optimization';
import DeveloperTools from '@/pages/DeveloperTools';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/subscription-success" element={<SubscriptionSuccess />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Profile />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/ai-agent" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AIAgent />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/news" element={
        <ProtectedRoute>
          <DashboardLayout>
            <News />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/compliance" element={
        <ProtectedRoute requiredRoles={['complianceOfficer', 'admin', 'executive']}>
          <DashboardLayout>
            <Compliance />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/compliance-cases" element={
        <ProtectedRoute requiredRoles={['complianceOfficer', 'admin', 'executive']}>
          <DashboardLayout>
            <ComplianceCases />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/cases/:caseId" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CaseDetails />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/kyc-verification" element={
        <ProtectedRoute requiredRoles={['complianceOfficer', 'admin']}>
          <DashboardLayout>
            <KYCVerification />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/transactions" element={
        <ProtectedRoute requiredRoles={['complianceOfficer', 'admin', 'executive']}>
          <DashboardLayout>
            <Transactions />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/documents" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Documents />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/aml-monitoring" element={
        <ProtectedRoute requiredRoles={['complianceOfficer', 'admin', 'executive']}>
          <DashboardLayout>
            <AMLMonitoring />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/risk-analysis" element={
        <ProtectedRoute requiredRoles={['complianceOfficer', 'admin', 'executive']}>
          <DashboardLayout>
            <RiskAnalysis />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/sar-center" element={
        <ProtectedRoute requiredRoles={['complianceOfficer', 'admin']}>
          <DashboardLayout>
            <SARCenter />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/audit-logs" element={
        <ProtectedRoute requiredRoles={['admin', 'complianceOfficer']}>
          <DashboardLayout>
            <AuditLogs />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/user-case" element={
        <ProtectedRoute requiredRoles={['complianceOfficer', 'admin']}>
          <DashboardLayout>
            <UserCase />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/user-case/:userId" element={
        <ProtectedRoute requiredRoles={['complianceOfficer', 'admin']}>
          <DashboardLayout>
            <UserCase />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <DashboardLayout>
            <Users />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/audits" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <DashboardLayout>
            <Audits />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/optimization" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <DashboardLayout>
            <Optimization />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/developer-tools" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <DashboardLayout>
            <DeveloperTools />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
