
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const AuditLogs = () => {
  console.log('AuditLogs page rendering...');
  
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
      <div className="w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            System audit trails and compliance logging.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">User Activities</h3>
            <p className="text-muted-foreground">User action audit trails</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">System Events</h3>
            <p className="text-muted-foreground">System-level audit events</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Compliance Events</h3>
            <p className="text-muted-foreground">Compliance-related activities</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
