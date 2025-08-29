
import { useState, useEffect } from 'react';
import { DashboardMetrics, Document } from '@/types';
import { DocumentStatus } from '@/types/supabase';
import { unifiedMockData } from '@/mocks/centralizedMockData';
import { config } from '@/config/environment';

export const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      if (!config.features.useMockData) {
        setMetrics({
          pendingDocuments: 0,
          pendingKycReviews: 0,
          activeAlerts: 0,
          riskScoreTrend: [],
          complianceCasesByType: { kyc: 0, aml: 0, sanctions: 0 }
        });
        setRecentDocuments([]);
        setLoading(false);
        return;
      }

      // Use centralized mock data
      const allDocuments = unifiedMockData.flatMap(user => user.documents);
      
      // Generate some additional mock documents for variety
      const mockDocuments: Document[] = [
        ...allDocuments,
        {
          id: 'doc_recent_1',
          userId: 'user_1',
          type: 'passport',
          fileName: 'passport_recent.pdf',
          uploadDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          extractedData: {
            name: 'Recent User 1',
            nationality: 'American'
          }
        },
        {
          id: 'doc_recent_2',
          userId: 'user_2',
          type: 'drivers_license',
          fileName: 'license_recent.pdf',
          uploadDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'verified',
          verifiedBy: 'admin_001',
          verificationDate: new Date().toISOString(),
          extractedData: {
            name: 'Recent User 2',
            nationality: 'Canadian'
          }
        }
      ];

      // Calculate metrics
      const pendingDocs = mockDocuments.filter(doc => doc.status === 'pending').length;
      const pendingKyc = unifiedMockData.filter(user => user.kycStatus === 'pending').length;
      const activeAlerts = config.features.useMockData ? Math.floor(Math.random() * 15) + 5 : 0;
      
      const dashboardMetrics: DashboardMetrics = {
        pendingDocuments: pendingDocs,
        pendingKycReviews: pendingKyc,
        activeAlerts,
        riskScoreTrend: [65, 72, 68, 74, 69, 78, 82],
        complianceCasesByType: {
          kyc: config.features.useMockData ? Math.floor(Math.random() * 50) + 10 : 0,
          aml: config.features.useMockData ? Math.floor(Math.random() * 30) + 5 : 0,
          sanctions: config.features.useMockData ? Math.floor(Math.random() * 10) + 2 : 0
        }
      };

      // Sort documents by upload date (most recent first) and take top 10
      const sortedDocuments = mockDocuments
        .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
        .slice(0, 10);

      setMetrics(dashboardMetrics);
      setRecentDocuments(sortedDocuments);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [config.features.useMockData]);

  return { metrics, recentDocuments, loading };
};
