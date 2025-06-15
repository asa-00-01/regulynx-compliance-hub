
import { UnifiedUserData } from '@/context/compliance/types';
import { AMLTransaction } from '@/types/aml';
import { Document } from '@/types';
import { ComplianceCaseDetails } from '@/types/case';
import { userProfiles } from './generators/userGenerator';
import { generateTransactionsForUser, generateAllTransactions } from './generators/transactionGenerator';
import { generateDocumentsForUser, generateAllDocuments } from './generators/documentGenerator';
import { generateCasesForUser, generateAllCases } from './generators/caseGenerator';

// Generate the complete unified user data using the generators
export const generateUnifiedUserData = (): UnifiedUserData[] => {
  return userProfiles.map(user => {
    const transactions = generateTransactionsForUser(user, Math.floor(Math.random() * 6) + 3);
    const documents = generateDocumentsForUser(user);
    const complianceCases = generateCasesForUser(user);
    
    return {
      ...user,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      kycFlags: {
        userId: user.id,
        is_registered: true,
        is_email_confirmed: user.kycStatus === 'verified',
        is_verified_pep: user.isPEP,
        is_sanction_list: user.isSanctioned,
        riskScore: user.riskScore
      },
      documents,
      transactions,
      complianceCases,
      notes: user.riskScore > 70 ? ['High risk user requiring enhanced monitoring'] : []
    };
  });
};

// Export the generated data
export const unifiedMockData = generateUnifiedUserData();

// Export individual collections for backward compatibility
export const mockUsersCollection = unifiedMockData;
export const mockTransactionsCollection = generateAllTransactions();
export const mockDocumentsCollection = generateAllDocuments();
export const mockComplianceCasesCollection = generateAllCases();

// Legacy exports for backward compatibility
export const baseCustomers = userProfiles;
export { generateTransactionsForUser, generateDocumentsForUser, generateComplianceCasesForUser: generateCasesForUser } from './generators/transactionGenerator';
