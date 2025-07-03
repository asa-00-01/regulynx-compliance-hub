
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Dashboard from '@/pages/Dashboard';
import AuthPage from '@/pages/AuthPage';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import AMLMonitoring from '@/pages/AMLMonitoring';
import KYCVerification from '@/pages/KYCVerification';
import Documents from '@/pages/Documents';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import ComplianceCases from '@/pages/ComplianceCases';
import SARCenter from '@/pages/SARCenter';
import Unauthorized from '@/pages/Unauthorized';
import Profile from '@/pages/Profile';
import Compliance from '@/pages/Compliance';
import UserCase from '@/pages/UserCase';
import AuditLogs from '@/pages/AuditLogs';
import RiskAnalysis from '@/pages/RiskAnalysis';
import Transactions from '@/pages/Transactions';
import AIAgent from '@/pages/AIAgent';
import News from '@/pages/News';
import Users from '@/pages/Users';
import Optimization from '@/pages/Optimization';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />
      } />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
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
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/optimization"
        element={
          <ProtectedRoute requiredRoles={['complianceOfficer', 'admin', 'executive', 'support']}>
            <Optimization />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-agent"
        element={
          <ProtectedRoute requiredRoles={['complianceOfficer', 'admin', 'executive', 'support']}>
            <AIAgent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/news"
        element={
          <ProtectedRoute requiredRoles={['complianceOfficer', 'admin', 'executive', 'support']}>
            <News />
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
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
