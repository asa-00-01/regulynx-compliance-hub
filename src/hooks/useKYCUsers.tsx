
import { useState, useEffect } from 'react';
import { KYCUser, UserFlags, KYCStatus } from '@/types/kyc';
import { useToast } from '@/hooks/use-toast';
import { useCompliance } from '@/context/compliance/useCompliance';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedUserData } from '@/context/compliance/types';

interface UseKYCUsersProps {
  initialUsers: (KYCUser & { flags: UserFlags; kycStatus?: KYCStatus })[];
}

const useKYCUsers = ({ initialUsers }: UseKYCUsersProps) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [flaggedUsers, setFlaggedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Default 20 items per page
  const { toast } = useToast();
  const { dispatch } = useCompliance();

  // Simulate loading state for UI improvements
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Initialize flagged users from the initial users data
  useEffect(() => {
    const flagged = initialUsers
      .filter(user => user.flags.is_sanction_list || user.flags.riskScore > 70)
      .map(user => user.id);
    setFlaggedUsers(flagged);
  }, [initialUsers]);

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

  // Pagination calculations
  const totalUsers = sortedUsers.length;
  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, riskFilter, activeTab, sortField, sortOrder]);

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
    setCurrentPage(1);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleFlagUser = async (userId: string) => {
    try {
      const user = initialUsers.find(u => u.id === userId);
      if (!user) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive"
        });
        return;
      }

      // Update the database to mark user as flagged
      const { error: dbError } = await supabase
        .from('organization_customers')
        .update({ 
          is_sanctioned: !user.flags.is_sanction_list, // Toggle sanction status as a flag
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Update local flagged users state
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

      // Update the compliance context
      const updatedUser = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        nationality: '',
        identityNumber: user.identityNumber,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        countryOfResidence: '',
        riskScore: user.flags.riskScore,
        isPEP: user.flags.is_verified_pep,
        isSanctioned: !user.flags.is_sanction_list, // Toggle the flag
        kycStatus: (user.kycStatus || 'pending') as KYCStatus,
        createdAt: user.createdAt,
        kycFlags: {
          ...user.flags,
          is_sanction_list: !user.flags.is_sanction_list // Toggle the flag
        },
        documents: [],
        transactions: [],
        complianceCases: [],
        notes: []
      };

      dispatch({ 
        type: 'UPDATE_USER_DATA', 
        payload: updatedUser as UnifiedUserData // Type assertion to avoid complex type issues
      });

    } catch (error) {
      console.error('Error flagging user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to flag user",
        variant: "destructive"
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

  // Fix: Ensure showResetFilters is always a boolean value
  const showResetFilters: boolean = Boolean(searchTerm || riskFilter !== 'all' || sortField !== 'name' || sortOrder !== 'asc' || activeTab !== 'all');

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
    paginatedUsers, // Add paginated users
    showResetFilters,
    // Pagination
    currentPage,
    itemsPerPage,
    totalPages,
    totalUsers,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    handleItemsPerPageChange
  };
};

export default useKYCUsers;
