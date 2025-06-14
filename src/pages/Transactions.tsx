
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Transactions = () => {
  console.log('Transactions page rendering...');
  
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Transaction Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time transaction monitoring and analysis.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Live Monitoring</h3>
            <p className="text-muted-foreground">Real-time transaction tracking</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Alert Management</h3>
            <p className="text-muted-foreground">Transaction alert processing</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-muted-foreground">Transaction pattern analysis</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
