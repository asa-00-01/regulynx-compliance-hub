
import { useState, useEffect } from 'react';
import { KYCUser, UserFlags } from '@/types/kyc';
import { useToast } from '@/hooks/use-toast';

interface UseKYCUsersProps {
  initialUsers: (KYCUser & { flags: UserFlags })[];
}

const useKYCUsers = ({ initialUsers }: UseKYCUsersProps) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [flaggedUsers, setFlaggedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Simulate loading state for UI improvements
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = initialUsers.filter(user => {
    // Apply search term
    if (searchTerm && !user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply tab filters
    if (activeTab === 'pep' && !user.flags.is_verified_pep) {
      return false;
    }
    if (activeTab === 'sanctioned' && !user.flags.is_sanction_list) {
      return false;
    }
    if (activeTab === 'high_risk' && user.flags.riskScore < 75) {
      return false;
    }
    if (activeTab === 'incomplete' && 
        (user.flags.is_email_confirmed && user.phoneNumber && user.identityNumber)) {
      return false;
    }
    if (activeTab === 'flagged' && !flaggedUsers.includes(user.id)) {
      return false;
    }

    // Apply risk filter
    if (riskFilter === 'high' && user.flags.riskScore < 75) return false;
    if (riskFilter === 'medium' && (user.flags.riskScore < 50 || user.flags.riskScore >= 75)) return false;
    if (riskFilter === 'low' && (user.flags.riskScore < 25 || user.flags.riskScore >= 50)) return false;
    if (riskFilter === 'minimal' && user.flags.riskScore >= 25) return false;
    
    return true;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'name') {
      comparison = a.fullName.localeCompare(b.fullName);
    } else if (sortField === 'risk') {
      comparison = a.flags.riskScore - b.flags.riskScore;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSortChange = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setRiskFilter('all');
    setSortField('name');
    setSortOrder('asc');
    setActiveTab('all');
  };

  const handleFlagUser = (userId: string) => {
    if (flaggedUsers.includes(userId)) {
      setFlaggedUsers(flaggedUsers.filter(id => id !== userId));
      toast({
        title: "User Unflagged",
        description: "User has been removed from flagged list"
      });
    } else {
      setFlaggedUsers([...flaggedUsers, userId]);
      toast({
        title: "User Flagged",
        description: "User has been added to flagged list for review"
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Exporting Data",
      description: "KYC data export has been initiated. File will be downloaded shortly."
    });
    
    // In a real implementation, this would generate a CSV file
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "KYC data has been exported successfully"
      });
    }, 1500);
  };

  const showResetFilters = searchTerm || riskFilter !== 'all' || sortField !== 'name' || sortOrder !== 'asc' || activeTab !== 'all';

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    riskFilter,
    setRiskFilter,
    sortField,
    sortOrder,
    handleSortChange,
    flaggedUsers,
    handleFlagUser,
    isLoading,
    handleResetFilters,
    handleExportData,
    sortedUsers,
    showResetFilters
  };
};

export default useKYCUsers;
