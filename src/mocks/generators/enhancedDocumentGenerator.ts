
import { EnhancedDocument, DocumentGenerationOptions } from './enhancedDocument/types';
import { generateMainIdentityDocument } from './enhancedDocument/identityDocumentGenerator';
import { generateAddressDocument } from './enhancedDocument/addressDocumentGenerator';
import { generateSourceOfFundsDocument, generateFinancialDocument } from './enhancedDocument/financialDocumentGenerator';
import { EnhancedUserProfile } from './user/types';

export type { EnhancedDocument, DocumentVerificationStep } from './enhancedDocument/types';

export const generateEnhancedDocuments = (user: EnhancedUserProfile): EnhancedDocument[] => {
  const documents: EnhancedDocument[] = [];
  
  const options: DocumentGenerationOptions = {
    userId: user.id,
    userName: user.fullName,
    userRiskScore: user.riskScore,
    kycStatus: user.kycStatus,
    isPEP: user.isPEP,
    isSanctioned: user.isSanctioned,
    transferHabit: user.transferHabit,
    address: user.address,
    dateOfBirth: user.dateOfBirth,
    nationality: user.nationality,
    personalIdentityNumber: user.personalIdentityNumber,
    originsOfFunds: user.originsOfFunds
  };
  
  // Main identity document (passport or national ID)
  const mainDocument = generateMainIdentityDocument(options);
  documents.push(mainDocument);
  
  // Address verification document
  const addressDocument = generateAddressDocument(options);
  documents.push(addressDocument);
  
  // Additional documents based on risk profile
  if (user.riskScore > 70 || user.isPEP) {
    const sourceOfFundsDocument = generateSourceOfFundsDocument(options);
    documents.push(sourceOfFundsDocument);
  }
  
  if (user.transferHabit === 'moreThanTenThousandSEK') {
    const financialDocument = generateFinancialDocument(options);
    documents.push(financialDocument);
  }
  
  return documents;
};
