
import { UnifiedUserData } from '@/context/compliance/types';
import { AMLTransaction } from '@/types/aml';
import { Document } from '@/types';
import { ComplianceCaseDetails } from '@/types/case';
import { Transaction } from '@/types/transaction';
import { 
  normalizedUsers, 
  normalizedTransactions, 
  normalizedDocuments, 
  normalizedComplianceCases,
  normalizedAlerts,
  normalizedSARs,
  normalizedPatterns,
  normalizedPatternMatches
} from './normalizedMockData';

// Extended transaction interface for normalized data
interface ExtendedTransaction extends Omit<Transaction, 'riskScore' | 'flagged'> {
  recipient?: string;
  recipientCountry?: string;
  type?: string;
  status?: string;
  riskScore?: number;
  flagged?: boolean;
  description?: string;
  alertId?: string;
}

// Convert Transaction objects to AMLTransaction objects
const convertToAMLTransactions = (transactions: ExtendedTransaction[]): AMLTransaction[] => {
  return transactions.map(tx => {
    // Generate meaningful recipient name based on destination country
    const getRecipientName = (destinationCountry: string, description: string): string => {
      switch (destinationCountry) {
        case 'Somalia':
          return 'Somalia Recipient';
        case 'Iran':
          return 'Iran Recipient';
        case 'Spain':
          return 'Spain Recipient';
        case 'Sweden':
          return 'Swedish Recipient';
        default:
          return `${destinationCountry} Recipient`;
      }
    };

    // Generate receiver user ID based on destination
    const getReceiverUserId = (destinationCountry: string, txId: string): string => {
      const countryCode = destinationCountry === 'Somalia' ? 'SO' : 
                         destinationCountry === 'Iran' ? 'IR' : 
                         destinationCountry === 'Spain' ? 'ES' : 'SE';
      return `receiver-${countryCode}-${txId.substring(0, 8)}`;
    };

    const recipientName = getRecipientName(tx.destinationCountry || 'Unknown', tx.description || '');
    const receiverUserId = getReceiverUserId(tx.destinationCountry || 'Unknown', tx.id);

    return {
      id: tx.id,
      senderUserId: tx.userId,
      receiverUserId: receiverUserId,
      senderName: tx.userName,
      receiverName: recipientName,
      senderAmount: tx.amount || 0,
      senderCurrency: tx.currency || 'SEK',
      receiverAmount: tx.amount || 0,
      receiverCurrency: tx.currency || 'SEK',
      method: tx.method || 'bank',
      status: tx.flagged ? 'flagged' : 'completed',
      timestamp: tx.timestamp,
      senderCountryCode: 'SE', // Default to Sweden
      receiverCountryCode: tx.destinationCountry === 'Somalia' ? 'SO' : 
                          tx.destinationCountry === 'Iran' ? 'IR' : 
                          tx.destinationCountry === 'Spain' ? 'ES' : 'SE',
      riskScore: tx.riskScore || 0,
      isSuspect: tx.flagged || false,
      flagged: tx.flagged || false,
      reasonForSending: tx.description || 'No reason provided',
      notes: tx.flagged ? 'Flagged for review' : undefined
    };
  });
};

// Convert normalized data to UnifiedUserData format
export const generateUnifiedUserData = (): UnifiedUserData[] => {
  console.log('🔄 Generating unified user data from normalized data...');
  
  const unifiedUsers = normalizedUsers
    .filter(user => user.role === 'admin' || user.role === 'complianceOfficer' ? false : true) // Only include customer users
    .map(user => {
      // Get user's transactions
      const userTransactions = normalizedTransactions.filter(tx => tx.userId === user.id);
      
      // Get user's documents
      const userDocuments = normalizedDocuments.filter(doc => doc.userId === user.id);
      
      // Get user's cases
      const userCases = normalizedComplianceCases.filter(case_ => case_.userId === user.id);
      
      // Get user's SARs
      const userSARs = normalizedSARs.filter(sar => sar.userId === user.id);
      
      // Convert transactions to AML format for UnifiedUserData
      const userAMLTransactions = convertToAMLTransactions(userTransactions);
      
      // Generate notes based on user profile
      const notes = [];
      if (user.riskScore > 70) {
        notes.push(`High risk user - Risk score: ${user.riskScore}`);
      }
      if (user.status === 'rejected') {
        notes.push('⚠️ Account rejected - Requires immediate review');
      }
      if (user.status === 'pending') {
        notes.push('KYC verification pending');
      }
      if (userTransactions.some(tx => tx.flagged)) {
        notes.push('Suspicious transaction patterns detected');
      }
      
      return {
        id: user.id,
        fullName: user.name,
        email: user.email,
        dateOfBirth: '1980-01-01', // Placeholder
        nationality: 'Swedish', // Placeholder
        identityNumber: '198001011234', // Placeholder
        phoneNumber: '0701234567', // Placeholder
        address: 'Stockholm, Sweden', // Placeholder
        countryOfResidence: 'Sweden',
        riskScore: user.riskScore,
        isPEP: false, // Placeholder
        isSanctioned: user.status === 'rejected',
        kycStatus: user.status,
        createdAt: '2023-01-01T00:00:00Z', // Placeholder
        kycFlags: {
          userId: user.id,
          is_registered: true,
          is_email_confirmed: true,
          is_verified_pep: false,
          is_sanction_list: user.status === 'rejected',
          riskScore: user.riskScore
        },
        documents: userDocuments,
        transactions: userAMLTransactions,
        complianceCases: userCases,
        notes,
        metadata: {
          enhancedProfile: true,
          transferHabit: userTransactions.length > 0 ? 'moreThanTenThousandSEK' : 'lessThanOneThousandSEK',
          frequencyOfTransaction: 'oncePerMonth',
          receiverCountries: [...new Set(userTransactions.map(tx => (tx as ExtendedTransaction).recipientCountry || 'Unknown'))],
          sendToMultipleRecipients: userTransactions.length > 1,
          recipientRelationship: ['family'],
          originsOfFunds: ['salary'],
          lastScreenedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      };
    });

  console.log(`✅ Generated ${unifiedUsers.length} unified users`);
  return unifiedUsers;
};

// Export normalized data collections
export const mockUsersCollection = normalizedUsers;
export const mockTransactionsCollection = normalizedTransactions;
export const mockAMLTransactionsCollection = convertToAMLTransactions(normalizedTransactions);
export const mockDocumentsCollection = normalizedDocuments;
export const mockComplianceCasesCollection = normalizedComplianceCases;
export const mockAlertsCollection = normalizedAlerts;
export const mockSARsCollection = normalizedSARs;
export const mockPatternsCollection = normalizedPatterns;
export const mockPatternMatchesCollection = normalizedPatternMatches;

// Export the unified data
export const unifiedMockData = generateUnifiedUserData();

// Export default for backward compatibility
export default {
  users: mockUsersCollection,
  transactions: mockTransactionsCollection,
  documents: mockDocumentsCollection,
  cases: mockComplianceCasesCollection,
  alerts: mockAlertsCollection,
  sars: mockSARsCollection,
  patterns: mockPatternsCollection,
  patternMatches: mockPatternMatchesCollection,
  unified: unifiedMockData
};
