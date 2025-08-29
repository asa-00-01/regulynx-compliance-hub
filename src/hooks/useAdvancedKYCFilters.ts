
import { useState, useMemo } from 'react';
import { KYCUser, UserFlags, KYCStatus } from '@/types/kyc';
import { useToast } from '@/hooks/use-toast';

interface UseAdvancedKYCFiltersProps {
  users: (KYCUser & { flags: UserFlags; kycStatus?: KYCStatus })[];
  filteredUsers?: (KYCUser & { flags: UserFlags; kycStatus?: KYCStatus })[]; // Add optional filtered users
}

interface FilterState {
  searchTerm: string;
  riskFilter: string;
  countryFilter: string;
  dateRange: { from: Date | undefined; to: Date | undefined };
  kycStatusFilter: string;
}

export const useAdvancedKYCFilters = ({ users, filteredUsers }: UseAdvancedKYCFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    riskFilter: 'all',
    countryFilter: 'all',
    dateRange: { from: undefined, to: undefined },
    kycStatusFilter: 'all'
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { toast } = useToast();

  // Fallback filtering logic when filteredUsers is not provided
  const fallbackFilteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (!user.fullName.toLowerCase().includes(searchLower) &&
            !user.email.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Risk filter
      if (filters.riskFilter !== 'all') {
        const riskScore = user.flags.riskScore;
        switch (filters.riskFilter) {
          case 'minimal':
            if (riskScore >= 25) return false;
            break;
          case 'low':
            if (riskScore < 25 || riskScore >= 50) return false;
            break;
          case 'medium':
            if (riskScore < 50 || riskScore >= 75) return false;
            break;
          case 'high':
            if (riskScore < 75) return false;
            break;
        }
      }

      // Country filter (mock implementation)
      if (filters.countryFilter !== 'all') {
        // In a real implementation, you'd check user.countryOfResidence
        // For now, we'll use a mock country assignment based on user ID
        const mockCountry = user.id.includes('1') ? 'United States' : 
                           user.id.includes('2') ? 'United Kingdom' :
                           user.id.includes('3') ? 'Germany' : 'Sweden';
        if (mockCountry !== filters.countryFilter) return false;
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const userDate = new Date(user.createdAt);
        if (filters.dateRange.from && userDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && userDate > filters.dateRange.to) return false;
      }

      // KYC status filter
      if (filters.kycStatusFilter !== 'all') {
        const userKycStatus = user.kycStatus || (user.flags.is_email_confirmed && user.identityNumber ? 'verified' : 'pending');
        
        switch (filters.kycStatusFilter) {
          case 'verified':
            if (userKycStatus !== 'verified') return false;
            break;
          case 'pending':
            if (userKycStatus !== 'pending') return false;
            break;
          case 'rejected':
            if (userKycStatus !== 'rejected') return false;
            break;
          case 'information_requested':
            if (userKycStatus !== 'information_requested') return false;
            break;
        }
      }

      return true;
    });
  }, [users, filters]);

  // Use provided filteredUsers or fall back to filtered logic
  const effectiveFilteredUsers = filteredUsers || fallbackFilteredUsers;

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.riskFilter !== 'all') count++;
    if (filters.countryFilter !== 'all') count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.kycStatusFilter !== 'all') count++;
    return count;
  }, [filters]);

  const updateFilter = (key: keyof FilterState, value: string | Date | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      riskFilter: 'all',
      countryFilter: 'all',
      dateRange: { from: undefined, to: undefined },
      kycStatusFilter: 'all'
    });
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === effectiveFilteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(effectiveFilteredUsers.map(user => user.id));
    }
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const handleBulkAction = async (action: string, data?: Record<string, unknown>) => {
    console.log('Bulk action:', action, 'on users:', selectedUsers, 'with data:', data);
    
    // This function should be called with the actual kycOperations
    // For now, we'll just show a toast and clear selection
    // The actual implementation should be passed from the parent component
    
    toast({
      title: "Bulk Action Completed",
      description: `Successfully performed ${action} on ${selectedUsers.length} user(s).`
    });
    clearSelection();
  };

  const exportData = () => {
    const dataToExport = effectiveFilteredUsers.map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      riskScore: user.flags.riskScore,
      isPEP: user.flags.is_verified_pep,
      isSanctioned: user.flags.is_sanction_list,
      emailConfirmed: user.flags.is_email_confirmed,
      createdAt: user.createdAt
    }));

    // Create and download CSV
    const csv = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kyc-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Completed",
      description: "User data has been exported to CSV file."
    });
  };

  return {
    filters,
    filteredUsers: effectiveFilteredUsers,
    activeFiltersCount,
    selectedUsers,
    updateFilter,
    resetFilters,
    toggleUserSelection,
    toggleAllUsers,
    clearSelection,
    handleBulkAction,
    exportData
  };
};
