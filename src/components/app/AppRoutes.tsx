
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import DashboardShell from '@/components/layout/DashboardShell';
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
      
      {/* Protected routes with persistent dashboard shell */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardShell />
        </ProtectedRoute>
      }>
        {/* Default dashboard route */}
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Profile route - accessible to all authenticated users */}
        <Route path="profile" element={<Profile />} />

        {/* AI Agent - accessible to all authenticated users */}
        <Route path="ai-agent" element={<AIAgent />} />

        {/* News - accessible to all authenticated users */}
        <Route path="news" element={<News />} />

        {/* Compliance routes */}
        <Route path="compliance" element={
          <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
            <Compliance />
          </DashboardLayout>
        } />

        <Route path="compliance-cases" element={
          <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
            <ComplianceCases />
          </DashboardLayout>
        } />

        <Route path="cases/:caseId" element={<CaseDetails />} />

        <Route path="kyc-verification" element={
          <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
            <KYCVerification />
          </DashboardLayout>
        } />

        <Route path="transactions" element={
          <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
            <Transactions />
          </DashboardLayout>
        } />

        <Route path="documents" element={<Documents />} />

        <Route path="aml-monitoring" element={
          <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
            <AMLMonitoring />
          </DashboardLayout>
        } />

        <Route path="risk-analysis" element={
          <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
            <RiskAnalysis />
          </DashboardLayout>
        } />

        <Route path="sar-center" element={
          <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
            <SARCenter />
          </DashboardLayout>
        } />

        <Route path="audit-logs" element={
          <DashboardLayout requiredRoles={['admin', 'complianceOfficer']}>
            <AuditLogs />
          </DashboardLayout>
        } />

        <Route path="user-case" element={
          <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
            <UserCase />
          </DashboardLayout>
        } />

        <Route path="user-case/:userId" element={
          <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
            <UserCase />
          </DashboardLayout>
        } />

        {/* Admin-only routes */}
        <Route path="users" element={
          <DashboardLayout requiredRoles={['admin']}>
            <Users />
          </DashboardLayout>
        } />

        <Route path="settings" element={
          <DashboardLayout requiredRoles={['admin']}>
            <Settings />
          </DashboardLayout>
        } />

        <Route path="audits" element={
          <DashboardLayout requiredRoles={['admin']}>
            <Audits />
          </DashboardLayout>
        } />

        <Route path="optimization" element={
          <DashboardLayout requiredRoles={['admin']}>
            <Optimization />
          </DashboardLayout>
        } />

        <Route path="developer-tools" element={
          <DashboardLayout requiredRoles={['admin']}>
            <DeveloperTools />
          </DashboardLayout>
        } />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
