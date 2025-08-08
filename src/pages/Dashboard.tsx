
import React from 'react';
import DashboardMetricsCard from '@/components/dashboard/DashboardMetricsCard';
import ComplianceSummaryCard from '@/components/dashboard/ComplianceSummaryCard';
import ComplianceCasesCard from '@/components/dashboard/ComplianceCasesCard';
import PerformanceOverviewCard from '@/components/dashboard/PerformanceOverviewCard';
import RecentDocumentsTable from '@/components/dashboard/RecentDocumentsTable';
import RiskScoreChart from '@/components/dashboard/RiskScoreChart';
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart';
import EnvironmentChecker from '@/components/common/EnvironmentChecker';
import { validateEnvironmentConfig, config } from '@/config/environment';

const Dashboard = () => {
  const { isValid, errors, warnings } = validateEnvironmentConfig();
  const shouldShowEnvironmentChecker = config.isDevelopment && (!isValid || warnings.length > 0);

  return (
    <div className="space-y-6">
      {shouldShowEnvironmentChecker && (
        <div className="mb-6">
          <EnvironmentChecker />
        </div>
      )}
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your compliance monitoring.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricsCard />
        <ComplianceSummaryCard />
        <ComplianceCasesCard />
        <PerformanceOverviewCard />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RiskScoreChart />
        <RiskDistributionChart />
      </div>

      <div className="grid gap-4">
        <RecentDocumentsTable />
      </div>
    </div>
  );
};

export default Dashboard;
