
import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardMetricsCard from '@/components/dashboard/DashboardMetricsCard';

interface DocumentStatsProps {
  stats: {
    pending: number;
    verified: number;
    rejected: number;
    total: number;
  };
}

const DocumentStats: React.FC<DocumentStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <DashboardMetricsCard
        title="Total Documents"
        value={stats.total}
        icon={FileText}
      />
      <DashboardMetricsCard
        title="Pending Review"
        value={stats.pending}
        icon={Clock}
        valueColor="text-yellow-600"
      />
      <DashboardMetricsCard
        title="Verified Documents"
        value={stats.verified}
        icon={CheckCircle}
        valueColor="text-green-600"
      />
      <DashboardMetricsCard
        title="Rejected Documents"
        value={stats.rejected}
        icon={AlertCircle}
        valueColor="text-red-600"
      />
    </div>
  );
};

export default DocumentStats;
