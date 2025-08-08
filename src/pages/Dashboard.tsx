
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
import { useDashboardData } from '@/hooks/useDashboardData';
import { useTransactionData } from '@/hooks/useTransactionData';
import { useComplianceCases } from '@/hooks/useComplianceCases';
import { FileText, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { isValid, errors, warnings } = validateEnvironmentConfig();
  const shouldShowEnvironmentChecker = config.isDevelopment && (!isValid || warnings.length > 0);
  
  // Get dashboard data
  const { metrics, recentDocuments, loading } = useDashboardData();
  const { metrics: transactionMetrics } = useTransactionData();
  const { cases: complianceCases, loading: casesLoading } = useComplianceCases();

  // Generate risk score chart data
  const riskScoreData = React.useMemo(() => {
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date.toISOString().split('T')[0],
        score: Math.floor(Math.random() * 40) + 60 // Random score between 60-100
      });
    }
    return last7Days;
  }, []);

  // Generate risk distribution data
  const riskDistributionData = React.useMemo(() => [
    { name: 'Low Risk', value: 245, color: '#22c55e' },
    { name: 'Medium Risk', value: 156, color: '#f59e0b' },
    { name: 'High Risk', value: 89, color: '#ef4444' },
  ], []);

  // Generate compliance metrics data
  const complianceMetrics = React.useMemo(() => ({
    totalTransactions: transactionMetrics?.totalTransactions || 12500,
    flaggedTransactions: transactionMetrics?.flaggedCount || 234,
    verifiedUsers: 8945,
    sanctionedUsers: 12,
    pepUsers: 45
  }), [transactionMetrics]);

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
        <DashboardMetricsCard 
          title="Pending Documents"
          value={metrics?.pendingDocuments || 0}
          icon={FileText}
          loading={loading}
        />
        <ComplianceSummaryCard 
          metrics={complianceMetrics}
          loading={loading}
        />
        <ComplianceCasesCard 
          complianceCases={complianceCases}
          loading={casesLoading}
        />
        <PerformanceOverviewCard />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RiskScoreChart 
          data={riskScoreData}
          loading={loading}
        />
        <RiskDistributionChart 
          data={riskDistributionData}
          loading={loading}
        />
      </div>

      <div className="grid gap-4">
        <RecentDocumentsTable 
          documents={recentDocuments || []}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
