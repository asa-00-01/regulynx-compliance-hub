
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
      // Additional enhanced fields for developer testing
      metadata: {
        enhancedProfile: true,
        transferHabit: profile.transferHabit,
        frequencyOfTransaction: profile.frequencyOfTransaction,
        receiverCountries: profile.receiverCountries,
        sendToMultipleRecipients: profile.sendToMultipleRecipients,
        recipientRelationship: profile.recipientRelationship,
        originsOfFunds: profile.originsOfFunds,
        lastScreenedAt: profile.screenedAt,
        lastLogin: profile.lastLogin,
        // Coherence indicators for testing
        hasCompleteDocuments: enhancedDocs.length >= 3,
        hasRecentTransactions: transactions.some(tx => 
          new Date(tx.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ),
        dataQualityScore: calculateDataQualityScore(profile, documents, transactions),
        testingReady: true
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
  
  // Distribute cases back to users and ensure coherent connections
  unifiedUsers.forEach(user => {
    const userCases = allCases.filter(case_ => case_.userId === user.id);
    user.complianceCases = userCases;
    
    // Ensure case consistency with user data
    userCases.forEach(case_ => {
      case_.userName = user.fullName;
      case_.riskScore = user.riskScore;
      
      // Link related transactions and documents
      if (case_.type === 'aml' && user.transactions.length > 0) {
        case_.relatedTransactions = user.transactions
          .filter(tx => tx.isSuspect || tx.riskScore > 70)
          .slice(0, 2)
          .map(tx => tx.id);
      }
      
      if (case_.type === 'kyc' && user.documents.length > 0) {
        case_.documents = user.documents
          .filter(doc => doc.status === 'pending' || doc.status === 'rejected')
          .slice(0, 2)
          .map(doc => doc.id);
      }
    });
  });

  // Final validation and coherence check
  console.log('✅ Cases assigned to users');
  console.log('🔗 Validating data coherence...');
  
  const coherenceReport = {
    totalUsers: unifiedUsers.length,
    usersWithDocuments: unifiedUsers.filter(u => u.documents.length > 0).length,
    usersWithTransactions: unifiedUsers.filter(u => u.transactions.length > 0).length,
    usersWithCases: unifiedUsers.filter(u => u.complianceCases.length > 0).length,
    completeTestUsers: unifiedUsers.filter(u => 
      u.documents.length > 0 && 
      u.transactions.length > 0 && 
      u.complianceCases.length > 0
    ).length
  };
  
  console.log('🎯 Data Coherence Report:', coherenceReport);
  
  if (coherenceReport.completeTestUsers === 0) {
    console.warn('⚠️ No users with complete test data found!');
  } else {
    console.log(`✅ ${coherenceReport.completeTestUsers} users ready for complete workflow testing`);
  }
  
  return unifiedUsers;
};

// Helper function to calculate data quality score for testing
const calculateDataQualityScore = (profile: any, documents: any[], transactions: any[]): number => {
  let score = 0;
  
  // Profile completeness (40 points)
  if (profile.fullName) score += 10;
  if (profile.email) score += 10;
  if (profile.phoneNumber) score += 10;
  if (profile.address) score += 10;
  
  // Document coverage (30 points)
  if (documents.length >= 1) score += 10;
  if (documents.length >= 2) score += 10;
  if (documents.length >= 3) score += 10;
  
  // Transaction history (30 points)
  if (transactions.length >= 1) score += 10;
  if (transactions.length >= 5) score += 10;
  if (transactions.length >= 10) score += 10;
  
  return score;
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
