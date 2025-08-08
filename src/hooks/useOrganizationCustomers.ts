
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrganizationCustomerService } from '@/services/organizationCustomerService';
import { 
  OrganizationCustomerInsert, 
  OrganizationCustomerUpdate,
  OrganizationCustomerFilters 
} from '@/types/organization-customers';
import { toast } from 'sonner';

export function useOrganizationCustomers(customerId: string, filters?: OrganizationCustomerFilters) {
  const queryClient = useQueryClient();

  // Get organization customers
  const { data: organizationCustomers, isLoading, error } = useQuery({
    queryKey: ['organizationCustomers', customerId, filters],
    queryFn: () => OrganizationCustomerService.getOrganizationCustomers(customerId, filters),
    enabled: !!customerId,
  });

  // Get organization customer stats
  const { data: stats } = useQuery({
    queryKey: ['organizationCustomerStats', customerId],
    queryFn: () => OrganizationCustomerService.getOrganizationCustomerStats(customerId),
    enabled: !!customerId,
  });

  // Create organization customer
  const createCustomerMutation = useMutation({
    mutationFn: (customerData: OrganizationCustomerInsert) =>
      OrganizationCustomerService.createOrganizationCustomer(customerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationCustomers'] });
      queryClient.invalidateQueries({ queryKey: ['organizationCustomerStats'] });
      toast.success('Customer created successfully');
    },
    onError: (error) => {
      console.error('Failed to create customer:', error);
      toast.error('Failed to create customer');
    },
  });

  // Update organization customer
  const updateCustomerMutation = useMutation({
    mutationFn: ({ customerId, updates }: { customerId: string; updates: OrganizationCustomerUpdate }) =>
      OrganizationCustomerService.updateOrganizationCustomer(customerId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationCustomers'] });
      queryClient.invalidateQueries({ queryKey: ['organizationCustomerStats'] });
      toast.success('Customer updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update customer:', error);
      toast.error('Failed to update customer');
    },
  });

  // Delete organization customer
  const deleteCustomerMutation = useMutation({
    mutationFn: (customerId: string) =>
      OrganizationCustomerService.deleteOrganizationCustomer(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationCustomers'] });
      queryClient.invalidateQueries({ queryKey: ['organizationCustomerStats'] });
      toast.success('Customer deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete customer:', error);
      toast.error('Failed to delete customer');
    },
  });

  // Update KYC status
  const updateKYCStatusMutation = useMutation({
    mutationFn: ({ customerId, status, notes }: { 
      customerId: string; 
      status: 'verified' | 'pending' | 'rejected' | 'information_requested';
      notes?: string;
    }) => OrganizationCustomerService.updateKYCStatus(customerId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationCustomers'] });
      toast.success('KYC status updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update KYC status:', error);
      toast.error('Failed to update KYC status');
    },
  });

  // Update risk score
  const updateRiskScoreMutation = useMutation({
    mutationFn: ({ customerId, riskScore }: { customerId: string; riskScore: number }) =>
      OrganizationCustomerService.updateRiskScore(customerId, riskScore),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationCustomers'] });
      toast.success('Risk score updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update risk score:', error);
      toast.error('Failed to update risk score');
    },
  });

  // Bulk import
  const bulkImportMutation = useMutation({
    mutationFn: (customers: OrganizationCustomerInsert[]) =>
      OrganizationCustomerService.bulkImportOrganizationCustomers(customers),
    onSuccess: (importedCustomers) => {
      queryClient.invalidateQueries({ queryKey: ['organizationCustomers'] });
      queryClient.invalidateQueries({ queryKey: ['organizationCustomerStats'] });
      toast.success(`Successfully imported ${importedCustomers.length} customers`);
    },
    onError: (error) => {
      console.error('Failed to import customers:', error);
      toast.error('Failed to import customers');
    },
  });

  return {
    // Data
    organizationCustomers: organizationCustomers || [],
    stats,
    isLoading,
    error,
    
    // Mutations
    createCustomer: createCustomerMutation.mutateAsync,
    updateCustomer: updateCustomerMutation.mutateAsync,
    deleteCustomer: deleteCustomerMutation.mutateAsync,
    updateKYCStatus: updateKYCStatusMutation.mutateAsync,
    updateRiskScore: updateRiskScoreMutation.mutateAsync,
    bulkImport: bulkImportMutation.mutateAsync,
    
    // Loading states
    isCreating: createCustomerMutation.isPending,
    isUpdating: updateCustomerMutation.isPending,
    isDeleting: deleteCustomerMutation.isPending,
    isUpdatingKYC: updateKYCStatusMutation.isPending,
    isUpdatingRisk: updateRiskScoreMutation.isPending,
    isImporting: bulkImportMutation.isPending,
  };
}

// Hook for getting a single organization customer
export function useOrganizationCustomer(customerId: string) {
  return useQuery({
    queryKey: ['organizationCustomer', customerId],
    queryFn: () => OrganizationCustomerService.getOrganizationCustomer(customerId),
    enabled: !!customerId,
  });
}

// Hook for getting organization customer transactions
export function useOrganizationCustomerTransactions(organizationCustomerId: string) {
  return useQuery({
    queryKey: ['organizationCustomerTransactions', organizationCustomerId],
    queryFn: () => OrganizationCustomerService.getOrganizationCustomerTransactions(organizationCustomerId),
    enabled: !!organizationCustomerId,
  });
}
