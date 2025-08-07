import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AlertCircle, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardMetricsCard from '@/components/dashboard/DashboardMetricsCard';
import RiskScoreChart from '@/components/dashboard/RiskScoreChart';
import ComplianceCasesCard from '@/components/dashboard/ComplianceCasesCard';
import ComplianceSummaryCard from '@/components/dashboard/ComplianceSummaryCard';
import RecentDocumentsTable from '@/components/dashboard/RecentDocumentsTable';
import PerformanceOverviewCard from '@/components/dashboard/PerformanceOverviewCard';
import { mockComplianceMetrics, mockRiskDistribution } from '@/components/aml/mockTransactionData';
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
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
      <div className="space-y-8 w-full">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex flex-col space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t('dashboard.title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('dashboard.welcome', { name: user?.name || 'User' })}
            </p>
          </div>
          {user && (
            <div className="text-sm text-muted-foreground bg-accent p-3 rounded-md border">
              <p>
                {t('dashboard.loggedInAs')} <strong className="text-foreground">{user.email}</strong>
              </p>
              <p>
                {t('dashboard.currentRole')} <strong className="text-foreground">{user.role}</strong>. {t('dashboard.roleDescription')}
              </p>
              <p className="mt-1 text-xs">
                {t('dashboard.testRoles')}
              </p>
            </div>
          )}
        </div>

        {/* Metrics Cards Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{t('dashboard.keyMetrics')}</h2>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array(4).fill(null).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-32 bg-muted rounded-lg border"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
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
              {/* Add Performance Overview Card */}
              <PerformanceOverviewCard />
            </div>
          )}
        </div>

        {/* Primary Charts Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{t('dashboard.riskAnalysis')}</h2>
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
          <h2 className="text-xl font-semibold text-foreground">{t('dashboard.recentActivity')}</h2>
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
    </DashboardLayout>
  );
};

export default Dashboard;
