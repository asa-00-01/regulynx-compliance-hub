
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProductionMonitorDashboard from '@/components/admin/ProductionMonitorDashboard';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProductionMonitor = () => {
  const { user } = useAuth();

  // Only allow admin users to access production monitoring
  if (user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <DashboardLayout>
      <ProductionMonitorDashboard />
    </DashboardLayout>
  );
};

export default ProductionMonitor;
