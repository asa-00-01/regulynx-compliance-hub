
import { useState, useEffect } from 'react';
import { DashboardMetrics, ComplianceCase } from '@/types/compliance';
import { Document } from '@/types/supabase';

export const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCases: 0,
    openCases: 0,
    pendingReview: 0,
    averageRiskScore: 0,
    riskScoreTrend: 5.2,
  });

  const [recentCases, setRecentCases] = useState<ComplianceCase[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Mock data for demonstration
        const mockMetrics: DashboardMetrics = {
          totalCases: 247,
          openCases: 38,
          pendingReview: 12,
          averageRiskScore: 67.3,
          riskScoreTrend: 5.2,
        };

        const mockCases: ComplianceCase[] = [
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
          },
          {
            id: '3',
            userId: 'user-789',
            type: 'sanctions',
            status: 'open',
            priority: 'medium',
            title: 'Sanctions Check Required',
            description: 'Customer sanctions screening needed',
            assignedTo: 'Erik Karlsson',
            createdAt: '2024-01-14T09:15:00Z',
            updatedAt: '2024-01-14T09:15:00Z',
            riskScore: 43,
          },
        ];

        const mockDocuments: Document[] = [
          {
            id: '1',
            customer_id: 'customer-123',
            filename: 'passport.pdf',
            document_type: 'passport',
            file_path: '/documents/passport.pdf',
            upload_date: '2024-01-15T10:00:00Z',
            status: 'pending',
            file_size: 1024000,
            mime_type: 'application/pdf',
            extracted_data: null,
            verification_notes: null,
            verified_at: null,
            verified_by: null,
          },
        ];

        setMetrics(mockMetrics);
        setRecentCases(mockCases);
        setRecentDocuments(mockDocuments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    metrics,
    recentCases,
    recentDocuments,
    loading,
  };
};
