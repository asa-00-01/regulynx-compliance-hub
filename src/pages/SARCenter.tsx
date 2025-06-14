
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const SARCenter = () => {
  console.log('SARCenter page rendering...');
  
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
      <div className="w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">SAR Center</h1>
          <p className="text-muted-foreground">
            Suspicious Activity Report management and filing center.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">New SARs</h3>
            <p className="text-muted-foreground">Create new suspicious activity reports</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Pending SARs</h3>
            <p className="text-muted-foreground">Reports awaiting submission</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Filed SARs</h3>
            <p className="text-muted-foreground">Successfully filed reports</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SARCenter;
