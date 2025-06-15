
import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardMetricsCard from '@/components/dashboard/DashboardMetricsCard';
import { useTranslation } from 'react-i18next';

interface DocumentStatsProps {
  stats: {
    pending: number;
    verified: number;
    rejected: number;
    total: number;
  };
}

const DocumentStats: React.FC<DocumentStatsProps> = ({ stats }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <DashboardMetricsCard
        title={t('documents.total')}
        value={stats.total}
        icon={FileText}
      />
      <DashboardMetricsCard
        title={t('documents.pending')}
        value={stats.pending}
        icon={Clock}
        valueColor="text-yellow-600"
      />
      <DashboardMetricsCard
        title={t('documents.verified')}
        value={stats.verified}
        icon={CheckCircle}
        valueColor="text-green-600"
      />
      <DashboardMetricsCard
        title={t('documents.rejected')}
        value={stats.rejected}
        icon={AlertCircle}
        valueColor="text-red-600"
      />
    </div>
  );
};

export default DocumentStats;
