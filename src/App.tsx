
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import AMLMonitoring from './pages/AMLMonitoring';
import KYCVerification from './pages/KYCVerification';
import Documents from './pages/Documents';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ComplianceCases from './pages/ComplianceCases';
import SARCenter from './pages/SARCenter';
import Unauthorized from './pages/Unauthorized';
import { useAuth } from './context/AuthContext';
import Compliance from './pages/Compliance';
import UserCase from './pages/UserCase';
import { ComplianceProvider } from './context/ComplianceContext';
import './App.css';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const { authLoaded } = useAuth();

  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <ComplianceProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/"
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
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ComplianceProvider>
  );
}

export default App;
