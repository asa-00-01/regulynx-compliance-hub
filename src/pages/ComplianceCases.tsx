
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const ComplianceCases = () => {
  console.log('ComplianceCases page rendering...');
  
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Compliance Cases</h1>
          <p className="text-muted-foreground">
            Manage and track compliance investigation cases.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Active Cases</h3>
            <p className="text-muted-foreground">Currently under investigation</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Pending Review</h3>
            <p className="text-muted-foreground">Awaiting compliance review</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Closed Cases</h3>
            <p className="text-muted-foreground">Completed investigations</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComplianceCases;
