
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AlertCircle, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import useDashboardData from '@/hooks/useDashboardData';
import DashboardMetricsCard from '@/components/dashboard/DashboardMetricsCard';
import RiskScoreChart from '@/components/dashboard/RiskScoreChart';
import ComplianceCasesCard from '@/components/dashboard/ComplianceCasesCard';
import ComplianceSummaryCard from '@/components/dashboard/ComplianceSummaryCard';
import RecentDocumentsTable from '@/components/dashboard/RecentDocumentsTable';
import { mockComplianceMetrics, mockRiskDistribution } from '@/components/aml/mockTransactionData';
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    highlightedStats, 
    riskScoreData, 
    complianceCases, 
    recentDocuments, 
    loading 
  } = useDashboardData(user?.role);
  
  // Map icon strings to actual components
  const iconMap = {
    'AlertCircle': AlertCircle,
    'Clock': Clock,
    'FileText': FileText
  };

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here's your compliance overview for today.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(null).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-24 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlightedStats.map((stat, index) => (
              <DashboardMetricsCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                changeType={stat.changeType}
                icon={iconMap[stat.icon as keyof typeof iconMap]}
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RiskScoreChart data={riskScoreData} loading={loading} />
          </div>
          <ComplianceCasesCard 
            complianceCases={complianceCases} 
            loading={loading} 
            currentUser={user} 
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentDocumentsTable documents={recentDocuments} loading={loading} />
          </div>
          <div className="space-y-6">
            <ComplianceSummaryCard metrics={mockComplianceMetrics} loading={loading} />
            <RiskDistributionChart data={mockRiskDistribution} loading={loading} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
