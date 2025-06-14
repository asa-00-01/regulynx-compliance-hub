
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCompliance } from '@/context/ComplianceContext';

export function useKYCActions() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setSelectedUser } = useCompliance();

  const handleViewProfile = (customerId: string) => {
    setSelectedUser(customerId);
    navigate(`/user-case/${customerId}`, {
      state: {
        returnTo: '/compliance'
      }
    });
    
    toast({
      title: "User Profile",
      description: "Opening complete user profile",
    });
  };

  const handleStartKYCReview = (customerId: string, customerName: string) => {
    navigate('/kyc-verification', {
      state: {
        userId: customerId,
        userName: customerName
      }
    });
    
    toast({
      title: "KYC Review Started",
      description: `Starting KYC verification for ${customerName}`,
    });
  };

  const handleViewDocuments = (customerId: string, customerName: string) => {
    navigate(`/documents?userId=${customerId}`);
    
    toast({
      title: "Documents",
      description: `Viewing documents for ${customerName}`,
    });
  };

  const handleViewTransactions = (customerId: string, customerName: string) => {
    navigate(`/aml-monitoring?userId=${customerId}`);
    
    toast({
      title: "Transaction History",
      description: `Viewing transactions for ${customerName}`,
    });
  };

  const handleCreateCase = (customerId: string, customerName: string, riskScore: number) => {
    navigate('/compliance-cases', {
      state: {
        createCase: true,
        userData: {
          userId: customerId,
          userName: customerName,
          description: `KYC compliance review for ${customerName} - Risk Score: ${riskScore}`,
          type: 'kyc',
          source: 'kyc_monitoring',
          riskScore: riskScore,
        }
      }
    });
    
    toast({
      title: "Case Created",
      description: `Compliance case created for ${customerName}`,
    });
  };

  const handleFlagUser = (customerId: string, customerName: string) => {
    // In a real app, this would update the user's flag status in the database
    toast({
      title: "User Flagged",
      description: `${customerName} has been flagged for review`,
      variant: "destructive",
    });
  };

  const handleCreateSAR = (customerId: string, customerName: string) => {
    navigate('/sar-center', {
      state: {
        createSAR: true,
        userData: {
          id: customerId,
          fullName: customerName
        }
      }
    });
    
    toast({
      title: "SAR Creation",
      description: "Navigating to create Suspicious Activity Report",
    });
  };

  return {
    handleViewProfile,
    handleStartKYCReview,
    handleViewDocuments,
    handleViewTransactions,
    handleCreateCase,
    handleFlagUser,
    handleCreateSAR
  };
}
