
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
import Rules from '@/pages/Rules';
import Settings from '@/pages/Settings';
import Audits from '@/pages/Audits';
import Pricing from '@/pages/Pricing';
import SubscriptionSuccess from '@/pages/SubscriptionSuccess';

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

      <Route path="/cases" element={
        <ProtectedRoute>
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

      <Route path="/documents" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Documents />
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

      <Route path="/rules" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <DashboardLayout>
            <Rules />
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
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
