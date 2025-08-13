
import { useState, useEffect } from 'react';
import { riskEvaluationService } from '@/services/risk/riskEvaluationService';
import { RiskFactor, RiskAssessmentResult } from '@/types/risk';
import { KYCCustomer, DashboardStatsProps, KYCPaginationResult } from './types';

interface KYCMonitoringData {
  totalUsers: number;
  pendingVerifications: number;
  riskAlerts: number;
  averageProcessingTime: number;
  recentRiskAssessments: RiskAssessmentResult[];
}

export const useKYCMonitoring = () => {
  const [data, setData] = useState<KYCMonitoringData>({
    totalUsers: 0,
    pendingVerifications: 0,
    riskAlerts: 0,
    averageProcessingTime: 0,
    recentRiskAssessments: []
  });
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [kycFilter, setKYCFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  
  // Modal states
  const [selectedCustomer, setSelectedCustomer] = useState<KYCCustomer | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [runningAssessment, setRunningAssessment] = useState(false);

  // Mock pagination data with proper type
  const [pagination] = useState<KYCPaginationResult>({
    currentData: [
      { 
        id: '1', 
        name: 'John Doe', 
        email: 'john@example.com',
        riskScore: 75, 
        kycStatus: 'pending',
        country: 'US',
        createdAt: new Date().toISOString(),
        lastTransaction: new Date().toISOString()
      },
      { 
        id: '2', 
        name: 'Jane Smith', 
        email: 'jane@example.com',
        riskScore: 45, 
        kycStatus: 'verified',
        country: 'UK',
        createdAt: new Date().toISOString(),
        lastTransaction: new Date().toISOString()
      },
    ],
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 2,
    itemsPerPage: 10,
    startIndex: 0,
    endIndex: 2,
    hasNextPage: false,
    hasPreviousPage: false,
    hasPrevPage: false,
    nextPage: () => {},
    previousPage: () => {},
    goToPage: () => {},
    goToNextPage: () => {},
    goToPrevPage: () => {},
    goToFirstPage: () => {},
    goToLastPage: () => {}
  });

  const runRiskAssessment = async () => {
    setRunningAssessment(true);
    try {
      // Mock assessment
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setRunningAssessment(false);
    }
  };

  const handleReview = (customerId: string) => {
    const customer = pagination.currentData.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setActionModalOpen(true);
    }
  };

  const handleFlag = (customerId: string) => {
    const customer = pagination.currentData.find(c => c.id === customerId);
    if (customer) {
      // In a real implementation, this would call an API to flag the customer
      console.log('Flagging customer:', customer.name);
      // Update the customer's risk score or status
      // This could trigger a notification to compliance officers
    }
  };

  const handleCreateCase = (customerId: string) => {
    const customer = pagination.currentData.find(c => c.id === customerId);
    if (customer) {
      // In a real implementation, this would navigate to case creation with pre-filled data
      console.log('Creating case for customer:', customer.name);
      // Navigate to case creation page with customer data
      // window.location.href = `/compliance-cases?create=true&customerId=${customerId}`;
    }
  };

  const handleViewProfile = (customerId: string) => {
    const customer = pagination.currentData.find(c => c.id === customerId);
    if (customer) {
      // In a real implementation, this would navigate to the customer's profile page
      console.log('Viewing profile for customer:', customer.name);
      // Navigate to customer profile page
      // window.location.href = `/customers/${customerId}`;
    }
  };

  const handlers = {
    handleReview,
    handleFlag,
    handleCreateCase,
    handleViewProfile
  };

  const stats: DashboardStatsProps = {
    totalUsers: data.totalUsers,
    pendingVerifications: data.pendingVerifications,
    riskAlerts: data.riskAlerts,
    averageProcessingTime: data.averageProcessingTime,
    flaggedUsers: 8,
    pendingReviews: 15,
    highRiskUsers: 12,
    recentAlerts: 5
  };

  useEffect(() => {
    const fetchKYCData = async () => {
      try {
        // Mock data - in real implementation, fetch from API
        const mockAssessments: RiskAssessmentResult[] = [];
        
        for (let i = 0; i < 5; i++) {
          const factors: RiskFactor[] = [
            { name: 'Identity Verification', value: Math.random() * 100, weight: 0.3 },
            { name: 'Document Quality', value: Math.random() * 100, weight: 0.2 },
            { name: 'Address Verification', value: Math.random() * 100, weight: 0.2 }
          ];

          // Use the service to evaluate customer risk with proper parameters
          const evaluation = await riskEvaluationService.evaluateCustomerRisk(`customer_${i}`, {});
          
          const assessmentResult: RiskAssessmentResult = {
            ...evaluation,
            total_risk_score: evaluation.score,
            risk_level: evaluation.level,
            matched_rules: [],
            rule_categories: []
          };

          mockAssessments.push(assessmentResult);
        }

        setData({
          totalUsers: 1250,
          pendingVerifications: 45,
          riskAlerts: 12,
          averageProcessingTime: 24,
          recentRiskAssessments: mockAssessments
        });
      } catch (error) {
        console.error('Error fetching KYC monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKYCData();
  }, []);

  return { 
    data, 
    loading,
    kycFilter,
    setKYCFilter,
    riskFilter,
    setRiskFilter,
    countryFilter,
    setCountryFilter,
    selectedCustomer,
    setSelectedCustomer,
    actionModalOpen,
    setActionModalOpen,
    runningAssessment,
    runRiskAssessment,
    pagination,
    stats,
    handlers
  };
};
