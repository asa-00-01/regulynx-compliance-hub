
import { UnifiedUserData } from '@/context/compliance/types';
import { AMLTransaction } from '@/types/aml';
import { Document } from '@/types';
import { ComplianceCaseDetails } from '@/types/case';

// Import enhanced generators
import { enhancedUserProfiles, convertToUnifiedUserData } from './generators/enhancedUserGenerator';
import { generateRealisticTransactions } from './generators/enhancedTransactionGenerator';
import { generateEnhancedDocuments } from './generators/enhancedDocumentGenerator';
import { generateCasesForUser, generateAllCases } from './generators/caseGenerator';

// Generate the complete unified user data using enhanced generators
export const generateUnifiedUserData = (): UnifiedUserData[] => {
  console.log('🔄 Generating enhanced unified user data...');
  
  const unifiedUsers = enhancedUserProfiles.map(profile => {
    // Convert to unified format
    const unifiedUser = convertToUnifiedUserData(profile);
    
    // Generate realistic transactions
    const transactions = generateRealisticTransactions(profile);
    console.log(`Generated ${transactions.length} transactions for ${profile.fullName}`);
    
    // Generate enhanced documents
    const enhancedDocs = generateEnhancedDocuments(profile);
    const documents = enhancedDocs.map(doc => ({
      id: doc.id,
      userId: doc.userId,
      type: doc.type,
      fileName: doc.fileName,
      uploadDate: doc.uploadDate,
      status: doc.status,
      verifiedBy: doc.verifiedBy,
      verificationDate: doc.verificationDate,
      extractedData: doc.extractedData
    }));
    console.log(`Generated ${documents.length} documents for ${profile.fullName}`);
    
    // Enhanced notes based on user profile
    const notes = [];
    if (profile.riskScore > 70) {
      notes.push(`High risk user - Risk score: ${profile.riskScore}`);
    }
    if (profile.isPEP) {
      notes.push('Politically Exposed Person - Enhanced due diligence required');
    }
    if (profile.isSanctioned) {
      notes.push('⚠️ SANCTIONS HIT - Account requires immediate review');
    }
    if (profile.transferHabit === 'moreThanTenThousandSEK') {
      notes.push('High-value transfer pattern detected');
    }
    if (profile.receiverCountries.some(country => ['Somalia', 'Somaliland', 'Iraq', 'Syria'].includes(country))) {
      notes.push('Transfers to high-risk jurisdictions');
    }
    
    return {
      ...unifiedUser,
      documents,
      transactions,
      complianceCases: [], // Will be populated after all users are created
      notes,
      // Additional enhanced fields
      metadata: {
        enhancedProfile: true,
        transferHabit: profile.transferHabit,
        frequencyOfTransaction: profile.frequencyOfTransaction,
        receiverCountries: profile.receiverCountries,
        sendToMultipleRecipients: profile.sendToMultipleRecipients,
        recipientRelationship: profile.recipientRelationship,
        originsOfFunds: profile.originsOfFunds,
        lastScreenedAt: profile.screenedAt,
        lastLogin: profile.lastLogin
      }
    };
  });

  // Now generate cases using the correct user IDs
  const userProfiles = unifiedUsers.map(user => ({
    id: user.id,
    fullName: user.fullName,
    riskScore: user.riskScore,
    isPEP: user.isPEP,
    isSanctioned: user.isSanctioned,
    kycStatus: user.kycStatus
  }));

  const allCases = generateAllCases(userProfiles);
  
  // Distribute cases back to users
  unifiedUsers.forEach(user => {
    user.complianceCases = allCases.filter(case_ => case_.userId === user.id);
  });

  console.log('✅ Cases assigned to users');
  return unifiedUsers;
};

// Export the generated data
export const unifiedMockData = generateUnifiedUserData();

// Export individual collections for backward compatibility
export const mockUsersCollection = unifiedMockData;
export const mockTransactionsCollection = unifiedMockData.flatMap(user => user.transactions);
export const mockDocumentsCollection = unifiedMockData.flatMap(user => user.documents);
export const mockComplianceCasesCollection = unifiedMockData.flatMap(user => user.complianceCases);

// Legacy exports for backward compatibility
export const baseCustomers = enhancedUserProfiles;
export { generateRealisticTransactions as generateTransactionsForUser } from './generators/enhancedTransactionGenerator';
export { generateEnhancedDocuments as generateDocumentsForUser } from './generators/enhancedDocumentGenerator';
export { generateCasesForUser as generateComplianceCasesForUser } from './generators/caseGenerator';

console.log('✅ Enhanced mock data initialized:', {
  users: unifiedMockData.length,
  totalTransactions: mockTransactionsCollection.length,
  totalDocuments: mockDocumentsCollection.length,
  totalCases: mockComplianceCasesCollection.length
});
