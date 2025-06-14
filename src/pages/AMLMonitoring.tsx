
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const AMLMonitoring = () => {
  console.log('AMLMonitoring page rendering...');
  
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
      <div className="w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AML Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor anti-money laundering activities and transactions.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Transaction Monitoring</h3>
            <p className="text-muted-foreground">Real-time transaction analysis</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
            <p className="text-muted-foreground">Automated risk scoring</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Alert Management</h3>
            <p className="text-muted-foreground">Manage suspicious activity alerts</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AMLMonitoring;
