
import React from 'react';
import { CaseSummary } from '@/types/case';
import {
  AlertCircleIcon,
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon
} from 'lucide-react';
import { mockComplianceCases } from '@/mocks/casesData';
import MetricCard from './dashboard/MetricCard';
import CaseStatusChart from './dashboard/CaseStatusChart';
import CaseRiskChart from './dashboard/CaseRiskChart';
import CaseTypeChart from './dashboard/CaseTypeChart';
import LoadingDashboard from './dashboard/LoadingDashboard';

interface CaseDashboardProps {
  summary: CaseSummary;
  loading: boolean;
  onViewAllCases: () => void;
}

const CaseDashboard: React.FC<CaseDashboardProps> = ({ 
  summary, 
  loading, 
  onViewAllCases
}) => {
  // Format data for charts
  const statusData = Object.entries(summary.casesByStatus || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' '),
    value
  }));

  const typeData = Object.entries(summary.casesByType || {}).map(([key, value]) => ({
    name: key.toUpperCase(),
    value
  }));

  const riskData = [
    { name: 'Low Risk (0-30)', value: mockComplianceCases.filter(c => c.riskScore < 30).length },
    { name: 'Medium Risk (30-60)', value: mockComplianceCases.filter(c => c.riskScore >= 30 && c.riskScore < 60).length },
    { name: 'High Risk (60-80)', value: mockComplianceCases.filter(c => c.riskScore >= 60 && c.riskScore < 80).length },
    { name: 'Critical Risk (80+)', value: mockComplianceCases.filter(c => c.riskScore >= 80).length },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
    return <LoadingDashboard />;
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Open Cases"
          value={summary.openCases}
          subtitle="Requiring attention"
          icon={
            <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
              <FileTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          }
        />

        <MetricCard
          title="High Risk Cases"
          value={summary.highRiskCases}
          subtitle="Score 70+"
          icon={
            <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20">
              <AlertCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          }
        />

        <MetricCard
          title="Resolved Last Week"
          value={summary.resolvedLastWeek}
          subtitle="Cases closed"
          icon={
            <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          }
        />

        <MetricCard
          title="Avg. Resolution Time"
          value={summary.averageResolutionDays > 0 ? `${summary.averageResolutionDays} days` : "N/A"}
          subtitle="For closed cases"
          icon={
            <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
              <ClockIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          }
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CaseStatusChart data={statusData} colors={COLORS} />
        <CaseRiskChart data={riskData} colors={COLORS} />
      </div>

      {/* Cases by Type Chart - Full Width */}
      <CaseTypeChart data={typeData} colors={COLORS} onViewAllCases={onViewAllCases} />
    </div>
  );
};

export default CaseDashboard;
