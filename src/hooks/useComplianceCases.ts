
import { useState, useEffect } from 'react';
import { ComplianceCaseDetails } from '@/types/compliance-cases';
import { useCaseActions } from '@/hooks/useComplianceCases/actions';

export const useComplianceCases = (organizationCustomerId?: string) => {
  const [cases, setCases] = useState<ComplianceCaseDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const caseActionsHook = useCaseActions();

  // Mock data for cases
  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCases: ComplianceCaseDetails[] = [
        {
          id: '1',
          type: 'kyc',
          status: 'open',
          risk_score: 75,
          created_at: new Date().toISOString(),
          priority: 'high',
          source: 'system',
          user_name: 'John Doe',
          description: 'KYC verification required',
          assigned_to: null,
          assigned_to_name: null,
          created_by: 'system',
          updated_at: new Date().toISOString(),
          resolved_at: null,
          related_alerts: [],
          related_transactions: [],
          documents: [],
          actions: []
        }
      ];
      
      setCases(mockCases);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [organizationCustomerId]);

  return {
    cases,
    loading,
    error,
    refreshCases: fetchCases,
    ...caseActionsHook
  };
};
