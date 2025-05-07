
import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Pages
import Dashboard from '@/pages/Dashboard';
import Documents from '@/pages/Documents';
import Compliance from '@/pages/Compliance';
import Transactions from '@/pages/Transactions';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import Index from '@/pages/Index';
import Users from '@/pages/Users';
import AuditLogs from '@/pages/AuditLogs';
import RiskAnalysis from '@/pages/RiskAnalysis';
import SARCenter from '@/pages/SARCenter';
import KYCVerification from '@/pages/KYCVerification';
import AMLMonitoring from '@/pages/AMLMonitoring';

// UI Components
import { Toaster } from '@/components/ui/toaster';

import './App.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/users" element={<Users />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/risk-analysis" element={<RiskAnalysis />} />
        <Route path="/sar-center" element={<SARCenter />} />
        <Route path="/kyc-verification" element={<KYCVerification />} />
        <Route path="/aml-monitoring" element={<AMLMonitoring />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
