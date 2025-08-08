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
import { ComplianceCaseDetails } from '@/types/case';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { metrics, loading } = useDashboardData();

  // Mock data for components that need it
  const mockRiskScoreData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
    score: Math.floor(Math.random() * 20) + 70
  }));

  const mockRiskDistributionData = [
    { name: 'Low Risk', value: 45, color: '#10B981' },
    { name: 'Medium Risk', value: 30, color: '#F59E0B' },
    { name: 'High Risk', value: 20, color: '#EF4444' },
    { name: 'Critical Risk', value: 5, color: '#DC2626' }
  ];

  const mockDocuments = [
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
      type: 'id' as const,
      fileName: 'id_jane_smith.pdf',
      uploadDate: new Date(Date.now() - 86400000).toISOString(),
      status: 'verified' as const,
    }
  ];

  const mockComplianceCases: ComplianceCaseDetails[] = [
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
  ];

  const mockComplianceMetrics = {
    totalTransactions: 12543,
    flaggedTransactions: 234,
    verifiedUsers: 8901,
    sanctionedUsers: 12,
    pepUsers: 45
  };

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
            title="Pending Documents"
            value={metrics?.pendingDocuments || 0}
            icon={() => null}
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
    </DashboardLayout>
  );
};

export default Dashboard;
