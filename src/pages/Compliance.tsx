
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Compliance = () => {
  console.log('Compliance page rendering...');
  
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Compliance Management</h1>
          <p className="text-muted-foreground">
            Comprehensive compliance oversight and management tools.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Policy Management</h3>
            <p className="text-muted-foreground">Manage compliance policies</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
            <p className="text-muted-foreground">Comprehensive risk analysis</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Regulatory Reporting</h3>
            <p className="text-muted-foreground">Generate regulatory reports</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Compliance;
