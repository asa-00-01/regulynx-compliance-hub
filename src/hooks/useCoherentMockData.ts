
import { useState, useEffect, useMemo } from 'react';
import { CoherentMockDataService } from '@/services/mockData/CoherentMockDataService';
import { UnifiedUserData } from '@/context/compliance/types';
import { config } from '@/config/environment';

export interface MockDataValidation {
  isValid: boolean;
  issues: string[];
  summary: {
    totalUsers: number;
    usersWithDocuments: number;
    usersWithTransactions: number;
    usersWithCases: number;
    orphanedDocuments: number;
    orphanedTransactions: number;
    orphanedCases: number;
  };
}

export type TestScenario = 'high_risk' | 'pending_kyc' | 'suspicious_aml' | 'pep' | 'sanctioned';

/**
 * Hook for accessing coherent mock data with complete user-document-transaction-case connections
 * Provides developers with consistent test data across all compliance modules
 */
export const useCoherentMockData = () => {
  const [validation, setValidation] = useState<MockDataValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const isMockMode = config.features.useMockData;

  // Get complete test user data
  const completeTestUser = useMemo(() => {
    if (!isMockMode) return null;
    return CoherentMockDataService.getCompleteTestUser();
  }, [isMockMode]);

  // Get all users with enhanced metadata
  const allUsersWithData = useMemo(() => {
    if (!isMockMode) return [];
    return CoherentMockDataService.getAllUsersWithRelatedData();
  }, [isMockMode]);

  // Validate data consistency
  const validateData = async () => {
    if (!isMockMode) return;
    
    setIsValidating(true);
    try {
      // Add a small delay to simulate validation process
      await new Promise(resolve => setTimeout(resolve, 500));
      const validationResult = CoherentMockDataService.validateDataConsistency();
      setValidation(validationResult);
      
      console.log('🔍 Mock Data Validation Results:', validationResult);
      
      if (validationResult.isValid) {
        console.log('✅ All mock data connections are coherent');
      } else {
        console.warn('⚠️ Found data consistency issues:', validationResult.issues);
      }
    } catch (error) {
      console.error('Failed to validate mock data:', error);
      setValidation({
        isValid: false,
        issues: ['Validation failed due to error'],
        summary: {
          totalUsers: 0,
          usersWithDocuments: 0,
          usersWithTransactions: 0,
          usersWithCases: 0,
          orphanedDocuments: 0,
          orphanedTransactions: 0,
          orphanedCases: 0
        }
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-validate on mount
  useEffect(() => {
    if (isMockMode) {
      validateData();
    }
  }, [isMockMode]);

  // Get test scenario data
  const getTestScenario = (scenario: TestScenario): UnifiedUserData[] => {
    if (!isMockMode) return [];
    return CoherentMockDataService.getTestScenario(scenario);
  };

  // Get user-specific data
  const getUserData = (userId: string) => {
    if (!isMockMode) return null;
    
    const user = CoherentMockDataService.getCompleteTestUser(userId);
    if (!user) return null;

    return {
      user,
      documents: CoherentMockDataService.getUserDocuments(userId),
      transactions: CoherentMockDataService.getUserTransactions(userId),
      complianceCases: CoherentMockDataService.getUserComplianceCases(userId)
    };
  };

  return {
    // Status
    isMockMode,
    isValidating,
    validation,
    
    // Data access
    completeTestUser,
    allUsersWithData,
    
    // Scenario testing
    getTestScenario,
    highRiskUsers: getTestScenario('high_risk'),
    pendingKYCUsers: getTestScenario('pending_kyc'),
    suspiciousAMLUsers: getTestScenario('suspicious_aml'),
    pepUsers: getTestScenario('pep'),
    sanctionedUsers: getTestScenario('sanctioned'),
    
    // User-specific data
    getUserData,
    
    // Validation
    validateData,
    
    // Service access
    service: CoherentMockDataService
  };
};
