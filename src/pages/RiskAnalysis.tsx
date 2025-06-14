
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const RiskAnalysis = () => {
  console.log('RiskAnalysis page rendering...');
  
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Risk Analysis</h1>
          <p className="text-muted-foreground">
            Advanced risk analysis and assessment tools.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Risk Scoring</h3>
            <p className="text-muted-foreground">Automated risk score calculations</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Pattern Analysis</h3>
            <p className="text-muted-foreground">Behavioral pattern detection</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Risk Reports</h3>
            <p className="text-muted-foreground">Comprehensive risk reporting</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RiskAnalysis;
