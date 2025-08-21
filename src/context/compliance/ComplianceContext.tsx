
import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrganizationCustomerService } from '@/services/organizationCustomerService';
import { EnrichedOrganizationCustomer, OrganizationCustomerFilters } from '@/types/organization-customers';

interface ComplianceContextType {
  customers: EnrichedOrganizationCustomer[];
  loading: boolean;
  error: string | null;
  filters: OrganizationCustomerFilters;
  setFilters: (filters: OrganizationCustomerFilters) => void;
  refreshCustomers: () => Promise<void>;
}

const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

export const useComplianceContext = () => {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useComplianceContext must be used within a ComplianceProvider');
  }
  return context;
};

export const ComplianceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<EnrichedOrganizationCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrganizationCustomerFilters>({});

  const refreshCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock customer ID for demo purposes
      const customerId = 'demo-customer-id';
      const data = await OrganizationCustomerService.getOrganizationCustomers(customerId, filters);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCustomers();
  }, [filters]);

  return (
    <ComplianceContext.Provider
      value={{
        customers,
        loading,
        error,
        filters,
        setFilters,
        refreshCustomers,
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
};
