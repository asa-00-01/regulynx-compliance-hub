
import { unifiedMockData, mockTransactionsCollection, mockDocumentsCollection, mockComplianceCasesCollection } from '../centralizedMockData';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalUsers: number;
    totalTransactions: number;
    totalDocuments: number;
    totalCases: number;
    riskDistribution: Record<string, number>;
    kycStatusDistribution: Record<string, number>;
  };
}

export const validateMockData = (): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate user data consistency
  const userIds = new Set(unifiedMockData.map(u => u.id));
  const transactionUserIds = new Set(mockTransactionsCollection.map(t => t.senderUserId));
  const documentUserIds = new Set(mockDocumentsCollection.map(d => d.userId));
  const caseUserIds = new Set(mockComplianceCasesCollection.map(c => c.userId));
  
  // Check for orphaned transactions
  const orphanedTransactions = mockTransactionsCollection.filter(t => !userIds.has(t.senderUserId));
  if (orphanedTransactions.length > 0) {
    errors.push(`Found ${orphanedTransactions.length} transactions with non-existent user IDs`);
  }
  
  // Check for orphaned documents
  const orphanedDocuments = mockDocumentsCollection.filter(d => !userIds.has(d.userId));
  if (orphanedDocuments.length > 0) {
    errors.push(`Found ${orphanedDocuments.length} documents with non-existent user IDs`);
  }
  
  // Check for orphaned cases
  const orphanedCases = mockComplianceCasesCollection.filter(c => !userIds.has(c.userId));
  if (orphanedCases.length > 0) {
    errors.push(`Found ${orphanedCases.length} cases with non-existent user IDs`);
  }
  
  // Check for users without transactions
  const usersWithoutTransactions = unifiedMockData.filter(u => !transactionUserIds.has(u.id));
  if (usersWithoutTransactions.length > 0) {
    warnings.push(`Found ${usersWithoutTransactions.length} users without any transactions`);
  }
  
  // Risk score distribution
  const riskDistribution = {
    low: unifiedMockData.filter(u => u.riskScore <= 30).length,
    medium: unifiedMockData.filter(u => u.riskScore > 30 && u.riskScore <= 70).length,
    high: unifiedMockData.filter(u => u.riskScore > 70).length
  };
  
  // KYC status distribution
  const kycStatusDistribution = {
    verified: unifiedMockData.filter(u => u.kycStatus === 'verified').length,
    pending: unifiedMockData.filter(u => u.kycStatus === 'pending').length,
    rejected: unifiedMockData.filter(u => u.kycStatus === 'rejected').length,
    information_requested: unifiedMockData.filter(u => u.kycStatus === 'information_requested').length
  };
  
  // Validate data quality
  unifiedMockData.forEach((user, index) => {
    if (!user.email.includes('@')) {
      errors.push(`User ${user.id} has invalid email format: ${user.email}`);
    }
    
    if (user.riskScore < 0 || user.riskScore > 100) {
      errors.push(`User ${user.id} has invalid risk score: ${user.riskScore}`);
    }
    
    if (user.isSanctioned && user.kycStatus === 'verified') {
      warnings.push(`User ${user.id} is sanctioned but has verified KYC status`);
    }
    
    if (user.isPEP && user.riskScore < 50) {
      warnings.push(`User ${user.id} is PEP but has low risk score: ${user.riskScore}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalUsers: unifiedMockData.length,
      totalTransactions: mockTransactionsCollection.length,
      totalDocuments: mockDocumentsCollection.length,
      totalCases: mockComplianceCasesCollection.length,
      riskDistribution,
      kycStatusDistribution
    }
  };
};

// Export a function to log validation results
export const logValidationResults = (): void => {
  const results = validateMockData();
  
  console.group('🔍 Mock Data Validation Results');
  console.log('📊 Summary:', results.summary);
  
  if (results.errors.length > 0) {
    console.group('❌ Errors:');
    results.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  if (results.warnings.length > 0) {
    console.group('⚠️ Warnings:');
    results.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }
  
  if (results.isValid) {
    console.log('✅ All data validation checks passed!');
  } else {
    console.log('❌ Data validation failed. Please review errors above.');
  }
  
  console.groupEnd();
};
