
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabasePlatformRoleService } from '@/services/supabasePlatformRoleService';
import { PlatformRole, CustomerRole, Customer, ExtendedUserProfile } from '@/types/platform-roles';
import { toast } from 'sonner';

export function usePlatformRoles() {
  const queryClient = useQueryClient();

  // Customer queries
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => SupabasePlatformRoleService.getCustomers(),
  });

  const getCustomer = (customerId: string) => useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => SupabasePlatformRoleService.getCustomer(customerId),
    enabled: !!customerId,
  });

  const getCustomerUsers = (customerId: string) => useQuery({
    queryKey: ['customerUsers', customerId],
    queryFn: () => SupabasePlatformRoleService.getCustomerUsers(customerId),
    enabled: !!customerId,
  });

  // Customer mutations
  const createCustomerMutation = useMutation({
    mutationFn: (customerData: Partial<Customer>) => 
      SupabasePlatformRoleService.createCustomer(customerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
    },
    onError: (error) => {
      console.error('Failed to create customer:', error);
      toast.error('Failed to create customer');
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ customerId, updates }: { customerId: string; updates: Partial<Customer> }) =>
      SupabasePlatformRoleService.updateCustomer(customerId, updates),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      toast.success('Customer updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update customer:', error);
      toast.error('Failed to update customer');
    },
  });

  // Platform role mutations
  const assignPlatformRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: PlatformRole }) =>
      SupabasePlatformRoleService.assignPlatformRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformRoles'] });
      toast.success('Platform role assigned successfully');
    },
    onError: (error) => {
      console.error('Failed to assign platform role:', error);
      toast.error('Failed to assign platform role');
    },
  });

  const removePlatformRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: PlatformRole }) =>
      SupabasePlatformRoleService.removePlatformRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformRoles'] });
      toast.success('Platform role removed successfully');
    },
    onError: (error) => {
      console.error('Failed to remove platform role:', error);
      toast.error('Failed to remove platform role');
    },
  });

  // Customer role mutations
  const assignCustomerRoleMutation = useMutation({
    mutationFn: ({ userId, customerId, role }: { userId: string; customerId: string; role: CustomerRole }) =>
      SupabasePlatformRoleService.assignCustomerRole(userId, customerId, role),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customerUsers', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customerRoles'] });
      toast.success('Customer role assigned successfully');
    },
    onError: (error) => {
      console.error('Failed to assign customer role:', error);
      toast.error('Failed to assign customer role');
    },
  });

  const removeCustomerRoleMutation = useMutation({
    mutationFn: ({ userId, customerId, role }: { userId: string; customerId: string; role: CustomerRole }) =>
      SupabasePlatformRoleService.removeCustomerRole(userId, customerId, role),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customerUsers', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customerRoles'] });
      toast.success('Customer role removed successfully');
    },
    onError: (error) => {
      console.error('Failed to remove customer role:', error);
      toast.error('Failed to remove customer role');
    },
  });

  return {
    // Data
    customers,
    customersLoading,
    
    // Queries
    getCustomer,
    getCustomerUsers,
    
    // Mutations
    createCustomer: createCustomerMutation.mutateAsync,
    updateCustomer: updateCustomerMutation.mutateAsync,
    assignPlatformRole: assignPlatformRoleMutation.mutateAsync,
    removePlatformRole: removePlatformRoleMutation.mutateAsync,
    assignCustomerRole: assignCustomerRoleMutation.mutateAsync,
    removeCustomerRole: removeCustomerRoleMutation.mutateAsync,
    
    // Loading states
    isCreatingCustomer: createCustomerMutation.isPending,
    isUpdatingCustomer: updateCustomerMutation.isPending,
    isAssigningPlatformRole: assignPlatformRoleMutation.isPending,
    isRemovingPlatformRole: removePlatformRoleMutation.isPending,
    isAssigningCustomerRole: assignCustomerRoleMutation.isPending,
    isRemovingCustomerRole: removeCustomerRoleMutation.isPending,
  };
}
