
import { useState, useMemo } from 'react';
import { KYCUser, UserFlags } from '@/types/kyc';
import { useToast } from '@/hooks/use-toast';

interface UseAdvancedKYCFiltersProps {
  users: (KYCUser & { flags: UserFlags })[];
}

interface FilterState {
  searchTerm: string;
  riskFilter: string;
  countryFilter: string;
  dateRange: { from: Date | undefined; to: Date | undefined };
  kycStatusFilter: string;
}

export const useAdvancedKYCFilters = ({ users }: UseAdvancedKYCFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    riskFilter: 'all',
    countryFilter: 'all',
    dateRange: { from: undefined, to: undefined },
    kycStatusFilter: 'all'
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
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
        const isVerified = user.flags.is_email_confirmed && user.identityNumber;
        const isPending = !user.flags.is_email_confirmed || !user.identityNumber;
        
        switch (filters.kycStatusFilter) {
          case 'verified':
            if (!isVerified) return false;
            break;
          case 'pending':
            if (!isPending) return false;
            break;
          case 'rejected':
            if (user.flags.is_sanction_list) return false;
            break;
        }
      }

      return true;
    });
  }, [users, filters]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.riskFilter !== 'all') count++;
    if (filters.countryFilter !== 'all') count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.kycStatusFilter !== 'all') count++;
    return count;
  }, [filters]);

  const updateFilter = (key: keyof FilterState, value: any) => {
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
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const handleBulkAction = (action: string, data?: any) => {
    console.log('Bulk action:', action, 'on users:', selectedUsers, 'with data:', data);
    
    // Simulate bulk action processing
    setTimeout(() => {
      toast({
        title: "Bulk Action Completed",
        description: `Successfully performed ${action} on ${selectedUsers.length} user(s).`
      });
      clearSelection();
    }, 1000);
  };

  const exportData = () => {
    const dataToExport = filteredUsers.map(user => ({
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
    filteredUsers,
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
