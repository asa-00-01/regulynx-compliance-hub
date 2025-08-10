
import { useState, useEffect } from 'react';
import { riskEvaluationService } from '@/services/risk/riskEvaluationService';
import { RiskFactor, RiskAssessmentResult } from '@/types/risk';

interface KYCMonitoringData {
  totalUsers: number;
  pendingVerifications: number;
  riskAlerts: number;
  averageProcessingTime: number;
  recentRiskAssessments: RiskAssessmentResult[];
}

interface Customer {
  id: string;
  name: string;
  riskScore: number;
}

interface PaginationData {
  currentData: Customer[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [runningAssessment, setRunningAssessment] = useState(false);

  // Mock pagination data
  const [pagination] = useState<PaginationData>({
    currentData: [
      { id: '1', name: 'John Doe', riskScore: 75 },
      { id: '2', name: 'Jane Smith', riskScore: 45 },
    ],
    currentPage: 1,
    totalPages: 1,
    pageSize: 10
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

  const handleReview = (customer: Customer) => {
    setSelectedCustomer(customer);
    setActionModalOpen(true);
  };

  const handleFlag = (customer: Customer) => {
    console.log('Flagging customer:', customer.name);
  };

  const handleCreateCase = (customer: Customer) => {
    console.log('Creating case for customer:', customer.name);
  };

  const handleViewProfile = (customer: Customer) => {
    console.log('Viewing profile for customer:', customer.name);
  };

  const handlers = {
    handleReview,
    handleFlag,
    handleCreateCase,
    handleViewProfile
  };

  const stats = {
    totalUsers: data.totalUsers,
    pendingVerifications: data.pendingVerifications,
    riskAlerts: data.riskAlerts,
    averageProcessingTime: data.averageProcessingTime
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
            total_risk_score: evaluation.total_risk_score || evaluation.score,
            risk_level: evaluation.risk_level || evaluation.level,
            matched_rules: evaluation.matched_rules || [],
            rule_categories: evaluation.rule_categories || []
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
