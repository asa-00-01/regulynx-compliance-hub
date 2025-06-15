
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { unifiedMockData } from '@/mocks/centralizedMockData';
import { evaluateUserRisk } from '@/services/risk';
import { usePagination } from '@/hooks/usePagination';
import { useCompliance } from '@/context/ComplianceContext';

const transformedCustomers = unifiedMockData.map(user => ({
  id: user.id,
  name: user.fullName,
  email: user.email,
  kycStatus: user.kycStatus,
  riskScore: user.riskScore,
  lastTransaction: user.transactions.length > 0 
    ? user.transactions[0].timestamp 
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  country: user.countryOfResidence || 'Unknown',
  transactions: user.transactions.length,
  amount: user.transactions.reduce((sum, tx) => sum + tx.senderAmount, 0),
}));

export const useKYCMonitoring = () => {
  const [customers, setCustomers] = useState(transformedCustomers);
  const [kycFilter, setKYCFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);
  const [runningAssessment, setRunningAssessment] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setSelectedUser } = useCompliance();

  const filteredCustomers = customers.filter((customer) => {
    const matchesKYC = kycFilter === 'all' || customer.kycStatus === kycFilter;
    
    const matchesRisk = 
      riskFilter === 'all' || 
      (riskFilter === 'low' && customer.riskScore <= 30) ||
      (riskFilter === 'medium' && customer.riskScore > 30 && customer.riskScore <= 70) ||
      (riskFilter === 'high' && customer.riskScore > 70);
    
    const matchesCountry = 
      countryFilter === '' || 
      customer.country.toLowerCase().includes(countryFilter.toLowerCase());
    
    return matchesKYC && matchesRisk && matchesCountry;
  });

  const pagination = usePagination({ 
    data: filteredCustomers, 
    itemsPerPage: 10 
  });

  const flaggedUsers = customers.filter(c => c.riskScore > 70).length;
  const pendingReviews = customers.filter(c => c.kycStatus === 'pending').length;
  const highRiskUsers = customers.filter(c => c.riskScore > 70).length;
  const recentAlerts = 3;

  const runRiskAssessment = async () => {
    setRunningAssessment(true);
    try {
      let assessedCount = 0;
      const updatedCustomers = [...customers];

      for (const customer of customers) {
        try {
          const userData = unifiedMockData.find(u => u.id === customer.id);
          if (userData) {
            console.log(`Running risk assessment for user: ${customer.name}`);
            const riskResult = await evaluateUserRisk(userData);
            
            const customerIndex = updatedCustomers.findIndex(c => c.id === customer.id);
            if (customerIndex !== -1) {
              updatedCustomers[customerIndex].riskScore = riskResult.total_risk_score;
            }
            assessedCount++;
          }
        } catch (error) {
          console.error(`Error assessing user ${customer.name}:`, error);
        }
      }

      setCustomers(updatedCustomers);
      toast({
        title: 'Risk Assessment Complete',
        description: `Successfully assessed ${assessedCount} out of ${customers.length} customers`,
      });
    } catch (error) {
      console.error('Error running risk assessment:', error);
      toast({
        title: 'Assessment Error',
        description: 'Failed to complete risk assessment',
        variant: 'destructive'
      });
    } finally {
      setRunningAssessment(false);
    }
  };

  const handleReview = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setActionModalOpen(true);
    }
  };

  const handleFlag = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setActionModalOpen(true);
    }
  };

  const handleViewProfile = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedUser(customerId);
      navigate(`/user-case/${customerId}`, {
        state: {
          returnTo: '/compliance'
        }
      });
      
      toast({
        title: "User Profile",
        description: `Opening complete profile for ${customer.name}`,
      });
    }
  };
  
  const handleCreateCase = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      navigate('/compliance-cases', { 
        state: { 
          createCase: true,
          userData: {
            userId: customer.id,
            userName: customer.name,
            riskScore: customer.riskScore
          }
        }
      });
    }
  };

  const stats = { flaggedUsers, pendingReviews, highRiskUsers, recentAlerts };
  const handlers = { handleReview, handleFlag, handleViewProfile, handleCreateCase };

  return {
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
    handlers,
  };
};
