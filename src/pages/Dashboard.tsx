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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Header Section */}
          <div className="space-y-3">
            <div className="flex flex-col space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Welcome back, {user?.name || 'User'}. Here's your compliance overview for today.
              </p>
            </div>
            {user && (
              <div className="text-sm text-muted-foreground bg-accent p-3 rounded-md border">
                <p>
                  Logged in as: <strong className="text-foreground">{user.email}</strong>
                </p>
                <p>
                  Current Role: <strong className="text-foreground">{user.role}</strong>. This determines which sidebar links and features are available.
                </p>
                <p className="mt-1 text-xs">
                  To test other roles, log out and use a different demo account (e.g., `admin@regulynx.com`, `compliance@regulynx.com`). Password is `password`.
                </p>
              </div>
            )}
          </div>

          {/* Metrics Cards Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Key Metrics</h2>
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array(4).fill(null).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-32 bg-muted rounded-lg border"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          </div>

          {/* Primary Charts Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Risk Analysis</h2>
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
              <div className="xl:col-span-2">
                {loading ? (
                  <div className="animate-pulse"><div className="h-80 bg-muted rounded-lg border"></div></div>
                ) : (
                  <RiskScoreChart data={riskScoreData} loading={loading} />
                )}
              </div>
              <div className="xl:col-span-1">
                {loading ? (
                  <div className="animate-pulse"><div className="h-80 bg-muted rounded-lg border"></div></div>
                ) : (
                  <ComplianceCasesCard 
                    complianceCases={complianceCases} 
                    loading={loading} 
                    currentUser={user} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Secondary Information Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity & Compliance</h2>
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
              <div className="xl:col-span-2">
                {loading ? (
                  <div className="animate-pulse"><div className="h-96 bg-muted rounded-lg border"></div></div>
                ) : (
                  <RecentDocumentsTable documents={recentDocuments} loading={loading} />
                )}
              </div>
              <div className="xl:col-span-1 space-y-6">
                {loading ? (
                  <>
                    <div className="animate-pulse"><div className="h-48 bg-muted rounded-lg border"></div></div>
                    <div className="animate-pulse"><div className="h-64 bg-muted rounded-lg border"></div></div>
                  </>
                ) : (
                  <>
                    <ComplianceSummaryCard metrics={mockComplianceMetrics} loading={loading} />
                    <RiskDistributionChart data={mockRiskDistribution} loading={loading} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
