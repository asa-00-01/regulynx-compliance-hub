
import { config } from '@/config/environment';
import MockDataService from './mockDataService';
import RealDataService from './realDataService';

interface DashboardMetrics {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  flaggedTransactions: number;
  totalTransactions: number;
  complianceScore: number;
  riskAlerts: number;
  documentsProcessed: number;
}

export const dashboardService = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    console.log('🔍 Fetching dashboard metrics...');
    
    try {
      if (config.features.useMockData) {
        // Use mock data
        const mockMetrics: DashboardMetrics = {
          totalUsers: 1250,
          verifiedUsers: 987,
          pendingVerifications: 43,
          flaggedTransactions: 12,
          totalTransactions: 8760,
          complianceScore: 94,
          riskAlerts: 5,
          documentsProcessed: 324
        };
        
        console.log('✅ Using mock dashboard metrics');
        return mockMetrics;
      } else {
        // Use real data service
        console.log('🌐 Fetching real dashboard metrics...');
        
        // For now, return default values since real implementation would need backend APIs
        const realMetrics: DashboardMetrics = {
          totalUsers: 0,
          verifiedUsers: 0,
          pendingVerifications: 0,
          flaggedTransactions: 0,
          totalTransactions: 0,
          complianceScore: 0,
          riskAlerts: 0,
          documentsProcessed: 0
        };
        
        return realMetrics;
      }
    } catch (error) {
      console.warn('Dashboard service error, returning default metrics:', error);
      
      // Return safe defaults on error
      return {
        totalUsers: 0,
        verifiedUsers: 0,
        pendingVerifications: 0,
        flaggedTransactions: 0,
        totalTransactions: 0,
        complianceScore: 0,
        riskAlerts: 0,
        documentsProcessed: 0
      };
    }
  }
};
