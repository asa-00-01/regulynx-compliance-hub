
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useDashboardData } from '@/hooks/useDashboardData';
import RecentDocumentsTable from '@/components/dashboard/RecentDocumentsTable';
import RiskScoreChart from '@/components/dashboard/RiskScoreChart';
import ComplianceCasesCard from '@/components/dashboard/ComplianceCasesCard';
import PerformanceOverviewCard from '@/components/dashboard/PerformanceOverviewCard';
import DashboardMetricsCard from '@/components/dashboard/DashboardMetricsCard';
import ComplianceSummaryCard from '@/components/dashboard/ComplianceSummaryCard';
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { metrics, loading } = useDashboardData();

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            {t('dashboard.welcome')}, {user?.name}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardMetricsCard 
            metrics={metrics} 
            loading={loading} 
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <RiskScoreChart />
          </div>
          <div className="col-span-3">
            <RiskDistributionChart />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <RecentDocumentsTable />
          </div>
          <div className="col-span-3 space-y-4">
            <ComplianceCasesCard />
            <PerformanceOverviewCard />
            <ComplianceSummaryCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
