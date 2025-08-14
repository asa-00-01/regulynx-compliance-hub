import React from 'react';
import { config } from '@/config/environment';
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
import { ComplianceCaseDetails } from '@/types/case';
import { 
  FileText, 
  AlertTriangle, 
  Users, 
  Shield, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { metrics, loading } = useDashboardData();

  // Mock data for components that need it (only when mock mode is enabled)
  const mockRiskScoreData = config.features.useMockData ? Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
    score: Math.floor(Math.random() * 20) + 70
  })) : [];

  const mockRiskDistributionData = config.features.useMockData ? [
    { name: 'Low Risk', value: 45, color: '#10B981' },
    { name: 'Medium Risk', value: 30, color: '#F59E0B' },
    { name: 'High Risk', value: 20, color: '#EF4444' },
    { name: 'Critical Risk', value: 5, color: '#DC2626' }
  ] : [];

  const mockDocuments = config.features.useMockData ? [
    {
      id: '1',
      userId: 'user1',
      type: 'passport' as const,
      fileName: 'passport_john_doe.pdf',
      uploadDate: new Date().toISOString(),
      status: 'pending' as const,
    },
    {
      id: '2',
      userId: 'user2', 
      type: 'drivers_license' as const,
      fileName: 'license_jane_smith.pdf',
      uploadDate: new Date(Date.now() - 86400000).toISOString(),
      status: 'verified' as const,
    }
  ] : [];

  const mockComplianceCases: ComplianceCaseDetails[] = config.features.useMockData ? [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'kyc' as const,
      status: 'open' as const,
      riskScore: 75,
      description: 'KYC review required',
      priority: 'medium' as const,
      source: 'manual' as const,
      assignedTo: 'admin_001',
      assignedToName: 'Alex Nordström',
      createdBy: 'system',
      relatedTransactions: [],
      relatedAlerts: [],
      documents: []
    }
  ] : [];

  const mockComplianceMetrics = config.features.useMockData ? {
    totalTransactions: 12543,
    flaggedTransactions: 234,
    verifiedUsers: 8901,
    sanctionedUsers: 12,
    pepUsers: 45
  } : undefined as unknown as typeof metrics;

  // Calculate additional metrics for the new cards
  const activeUsers = 1247;
  const systemUptime = 99.9;
  const avgProcessingTime = 2.3;
  const totalAlerts = metrics?.activeAlerts || 0;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {t('dashboard.welcome', {name: user?.name})}
        </h2>
      </div>

      {/* Main Metrics Grid - 2 rows of 4 cards each */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricsCard 
          title="Pending Documents"
          value={metrics?.pendingDocuments || 0}
          change="+3"
          changeType="increase"
          icon={FileText}
          loading={loading}
        />
        
        <DashboardMetricsCard 
          title="KYC Reviews"
          value={metrics?.pendingKycReviews || 0}
          change="-2"
          changeType="decrease"
          icon={Users}
          changeDirection="positive-down"
          loading={loading}
        />
        
        <DashboardMetricsCard 
          title="Active Alerts"
          value={totalAlerts}
          change="+5"
          changeType="increase"
          icon={AlertTriangle}
          valueColor="text-red-600"
          loading={loading}
        />
        
        <DashboardMetricsCard 
          title="Risk Score Trend"
          value={metrics?.riskScoreTrend?.[metrics.riskScoreTrend.length - 1] || 0}
          change="-3.2"
          changeType="decrease"
          icon={Shield}
          changeDirection="positive-down"
          valueColor="text-orange-600"
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricsCard 
          title="Active Users"
          value={activeUsers}
          change="+12%"
          changeType="increase"
          icon={Activity}
          changeDirection="positive-up"
          valueColor="text-green-600"
          loading={loading}
        />
        
        <DashboardMetricsCard 
          title="System Uptime"
          value={`${systemUptime}%`}
          icon={CheckCircle}
          valueColor="text-green-600"
          loading={loading}
        />
        
        <DashboardMetricsCard 
          title="Avg Processing Time"
          value={`${avgProcessingTime}s`}
          change="-0.2s"
          changeType="decrease"
          icon={Clock}
          changeDirection="positive-down"
          loading={loading}
        />
        
        <DashboardMetricsCard 
          title="Compliance Rate"
          value="97.8%"
          change="+1.2%"
          changeType="increase"
          icon={TrendingUp}
          changeDirection="positive-up"
          valueColor="text-green-600"
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RiskScoreChart data={mockRiskScoreData} loading={loading} />
        </div>
        <div className="col-span-3">
          <RiskDistributionChart data={mockRiskDistributionData} loading={loading} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RecentDocumentsTable documents={mockDocuments} loading={loading} />
        </div>
        <div className="col-span-3 space-y-4">
          <ComplianceCasesCard complianceCases={mockComplianceCases} loading={loading} />
          <PerformanceOverviewCard />
          <ComplianceSummaryCard metrics={mockComplianceMetrics} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
