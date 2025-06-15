
import { useState, useEffect } from 'react';
import { DashboardMetrics, Document, ComplianceCase, UserRole } from '@/types';

// Mock data for dashboard metrics
const getMockDashboardData = (): DashboardMetrics => ({
  pendingDocuments: 18,
  pendingKycReviews: 12,
  activeAlerts: 7,
  riskScoreTrend: [65, 59, 80, 81, 56, 55, 72, 68],
  complianceCasesByType: {
    kyc: 8,
    aml: 5,
    sanctions: 2,
  },
});

// Mock data for recent documents
const getMockRecentDocuments = (): Document[] => [
  {
    id: '1',
    userId: '101',
    type: 'passport',
    fileName: 'passport_john_doe.pdf',
    uploadDate: '2025-05-01T10:30:00Z',
    status: 'pending',
  },
  {
    id: '2',
    userId: '102',
    type: 'id',
    fileName: 'national_id_anna.jpg',
    uploadDate: '2025-05-02T09:15:00Z',
    status: 'verified',
    verifiedBy: '1',
    verificationDate: '2025-05-02T14:20:00Z',
  },
  {
    id: '3',
    userId: '103',
    type: 'license',
    fileName: 'drivers_license_mikhail.png',
    uploadDate: '2025-05-03T11:45:00Z',
    status: 'rejected',
    verifiedBy: '1',
    verificationDate: '2025-05-03T16:30:00Z',
  },
  {
    id: '4',
    userId: '104',
    type: 'passport',
    fileName: 'passport_sarah.pdf',
    uploadDate: '2025-05-03T13:10:00Z',
    status: 'pending',
  },
];

// Mock data for compliance cases
const getMockComplianceCases = (): ComplianceCase[] => [
  {
    id: '1',
    userId: '101',
    createdAt: '2025-05-01T08:30:00Z',
    type: 'kyc',
    status: 'open',
    riskScore: 75,
    description: 'Inconsistent identity information',
    assignedTo: '1',
  },
  {
    id: '2',
    userId: '105',
    createdAt: '2025-05-02T10:15:00Z',
    type: 'aml',
    status: 'escalated',
    riskScore: 92,
    description: 'Multiple high-value transactions from high-risk country',
    assignedTo: '1',
  },
  {
    id: '3',
    userId: '107',
    createdAt: '2025-05-02T14:45:00Z',
    type: 'sanctions',
    status: 'open',
    riskScore: 85,
    description: 'Potential sanctions list match',
    assignedTo: '1',
  },
];

// Mock data for risk score chart
const getRiskScoreData = () => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      score: Math.floor(Math.random() * 20) + 60,
    });
  }
  return data;
};

// Get role-specific stats to highlight
const getHighlightedStats = (userRole?: UserRole, metrics?: DashboardMetrics) => {
  if (!metrics) return [];

  switch (userRole) {
    case 'complianceOfficer':
      return [
        {
          title: 'Pending Reviews',
          value: metrics.pendingKycReviews,
          change: '+2',
          changeType: 'increase',
          icon: 'Clock',
        },
        {
          title: 'High Risk Cases',
          value: 5,
          change: '-1',
          changeType: 'decrease',
          icon: 'AlertCircle',
        },
        {
          title: 'Pending Documents',
          value: metrics.pendingDocuments,
          change: '+3',
          changeType: 'increase',
          icon: 'FileText',
        },
        {
          title: 'Active Alerts',
          value: metrics.activeAlerts,
          change: '+1',
          changeType: 'increase',
          icon: 'AlertCircle',
        },
      ];
    case 'admin':
      return [
        {
          title: 'Active Users',
          value: 42,
          change: '+3',
          changeType: 'increase',
          icon: 'AlertCircle',
        },
        {
          title: 'System Alerts',
          value: 2,
          change: '-1',
          changeType: 'decrease',
          icon: 'AlertCircle',
        },
        {
          title: 'Pending Documents',
          value: metrics.pendingDocuments,
          change: '+3',
          changeType: 'increase',
          icon: 'FileText',
        },
        {
          title: 'Active Roles',
          value: 4,
          change: '0',
          changeType: 'neutral',
          icon: 'AlertCircle',
        },
      ];
    case 'executive':
      return [
        {
          title: 'Average Risk Score',
          value: 68,
          change: '-3',
          changeType: 'decrease',
          icon: 'AlertCircle',
        },
        {
          title: 'Open Cases',
          value: 15,
          change: '+2',
          changeType: 'increase',
          icon: 'Clock',
        },
        {
          title: 'Escalated Issues',
          value: 3,
          change: '+1',
          changeType: 'increase',
          icon: 'AlertCircle',
        },
        {
          title: 'Compliance Rate',
          value: '94%',
          change: '+2%',
          changeType: 'increase',
          icon: 'AlertCircle',
        },
      ];
    case 'support':
      return [
        {
          title: 'Customer Tickets',
          value: 8,
          change: '+1',
          changeType: 'increase',
          icon: 'AlertCircle',
        },
        {
          title: 'Pending Documents',
          value: metrics.pendingDocuments,
          change: '+3',
          changeType: 'increase',
          icon: 'FileText',
        },
        {
          title: 'Average Response Time',
          value: '1.2h',
          change: '-0.3h',
          changeType: 'decrease',
          icon: 'Clock',
        },
        {
          title: 'Active Alerts',
          value: metrics.activeAlerts,
          change: '+1',
          changeType: 'increase',
          icon: 'AlertCircle',
        },
      ];
    default:
      return [];
  }
};

export const useDashboardData = (userRole?: UserRole) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [complianceCases, setComplianceCases] = useState<ComplianceCase[]>([]);
  const [riskScoreData, setRiskScoreData] = useState<{date: string; score: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedStats, setHighlightedStats] = useState<any[]>([]);

  useEffect(() => {
    // Simulate API calls to fetch dashboard data
    const timer = setTimeout(() => {
      const dashboardData = getMockDashboardData();
      setMetrics(dashboardData);
      setRecentDocuments(getMockRecentDocuments());
      setComplianceCases(getMockComplianceCases());
      setRiskScoreData(getRiskScoreData());
      setHighlightedStats(getHighlightedStats(userRole, dashboardData));
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [userRole]);

  return {
    metrics,
    recentDocuments,
    complianceCases,
    riskScoreData,
    highlightedStats,
    loading
  };
};

export default useDashboardData;
