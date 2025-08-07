
import { useState, useEffect } from 'react';
import { DashboardMetrics, ComplianceCase } from '@/types/compliance';
import { Document } from '@/types/supabase';

export const useDashboardData = (userRole?: string) => {
  const [highlightedStats, setHighlightedStats] = useState<any[]>([]);
  const [riskScoreData, setRiskScoreData] = useState<any[]>([]);
  const [complianceCases, setComplianceCases] = useState<ComplianceCase[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Mock highlighted stats
        const mockHighlightedStats = [
          {
            title: 'Total Cases',
            value: '247',
            change: '+12%',
            changeType: 'positive' as const,
            icon: 'AlertCircle'
          },
          {
            title: 'Pending Reviews',
            value: '38',
            change: '-5%',
            changeType: 'negative' as const,
            icon: 'Clock'
          },
          {
            title: 'Documents Processed',
            value: '1,234',
            change: '+8%',
            changeType: 'positive' as const,
            icon: 'FileText'
          },
          {
            title: 'Risk Score Avg',
            value: '67.3',
            change: '+2.1%',
            changeType: 'neutral' as const,
            icon: 'AlertCircle'
          }
        ];

        // Mock risk score data
        const mockRiskScoreData = [
          { name: 'Jan', riskScore: 65 },
          { name: 'Feb', riskScore: 68 },
          { name: 'Mar', riskScore: 72 },
          { name: 'Apr', riskScore: 69 },
          { name: 'May', riskScore: 75 },
          { name: 'Jun', riskScore: 73 }
        ];

        // Mock compliance cases
        const mockComplianceCases: ComplianceCase[] = [
          {
            id: '1',
            userId: 'user-123',
            type: 'kyc',
            status: 'open',
            priority: 'high',
            title: 'KYC Verification Required',
            description: 'New customer requires KYC verification',
            assignedTo: 'Johan Berg',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
            riskScore: 85,
          },
          {
            id: '2',
            userId: 'user-456',
            type: 'aml',
            status: 'escalated',
            priority: 'critical',
            title: 'Suspicious Transaction Pattern',
            description: 'Large transaction pattern detected',
            assignedTo: 'Maria Andersson',
            createdAt: '2024-01-14T16:45:00Z',
            updatedAt: '2024-01-14T18:20:00Z',
            riskScore: 92,
          }
        ];

        // Mock recent documents
        const mockRecentDocuments: Document[] = [
          {
            id: '1',
            user_id: 'customer-123',
            file_name: 'passport.pdf',
            type: 'passport',
            file_path: '/documents/passport.pdf',
            upload_date: '2024-01-15T10:00:00Z',
            status: 'pending',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
            extracted_data: null,
            verification_date: null,
            verified_by: null,
          },
        ];

        setHighlightedStats(mockHighlightedStats);
        setRiskScoreData(mockRiskScoreData);
        setComplianceCases(mockComplianceCases);
        setRecentDocuments(mockRecentDocuments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userRole]);

  return {
    highlightedStats,
    riskScoreData,
    complianceCases,
    recentDocuments,
    loading,
  };
};

export default useDashboardData;
