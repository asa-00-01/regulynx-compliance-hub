
import { UnifiedUserData } from '@/context/compliance/types';
import { Document, ComplianceCase } from '@/types';
import { AMLTransaction } from '@/types/aml';
import { ComplianceCaseDetails } from '@/types/case';
import { enhancedUserProfiles, convertToUnifiedUserData } from './generators/enhancedUserGenerator';
import { generateEnhancedDocuments, EnhancedDocument } from './generators/enhancedDocumentGenerator';

// Generate mock compliance cases
const generateMockComplianceCases = (): ComplianceCaseDetails[] => {
  return enhancedUserProfiles.slice(0, 10).map((profile, index) => ({
    id: `case_${index + 1}`,
    userId: profile.id,
    userName: profile.fullName,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    type: ['kyc', 'aml', 'sanctions'][Math.floor(Math.random() * 3)] as 'kyc' | 'aml' | 'sanctions',
    status: ['open', 'under_review', 'escalated', 'pending_info', 'closed'][Math.floor(Math.random() * 5)] as any,
    riskScore: Math.floor(Math.random() * 100),
    description: `Case investigation for ${profile.fullName}`,
    priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
    source: 'manual' as any,
  }));
};

// Generate mock transactions
const generateMockTransactions = (): AMLTransaction[] => {
  return enhancedUserProfiles.slice(0, 50).map((profile, index) => ({
    id: `tx_${index + 1}`,
    senderUserId: profile.id,
    senderName: profile.fullName,
    receiverName: `Receiver ${index + 1}`,
    amount: Math.floor(Math.random() * 100000) + 1000,
    currency: 'USD',
    timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    type: ['deposit', 'withdrawal', 'transfer'][Math.floor(Math.random() * 3)] as any,
    status: 'completed',
    riskScore: Math.floor(Math.random() * 100),
    senderCountry: profile.countryOfResidence,
    receiverCountry: ['US', 'GB', 'DE', 'FR', 'SE'][Math.floor(Math.random() * 5)],
    flags: [],
  }));
};

// Convert enhanced profiles to unified format
export const unifiedMockData: UnifiedUserData[] = enhancedUserProfiles.map(profile => {
  const userData = convertToUnifiedUserData(profile);
  
  // Generate enhanced documents for each user
  const enhancedDocs = generateEnhancedDocuments(profile);
  
  // Convert enhanced documents to regular Document format
  const documents: Document[] = enhancedDocs.map((doc: EnhancedDocument) => ({
    id: doc.id,
    userId: doc.userId,
    type: doc.type,
    fileName: doc.fileName,
    uploadDate: doc.uploadDate,
    status: doc.status,
    verifiedBy: doc.verifiedBy,
    verificationDate: doc.verificationDate,
    extractedData: doc.extractedData,
  }));
  
  return {
    ...userData,
    documents,
    transactions: [], // Would be populated from AML mock data
    complianceCases: [], // Would be populated from compliance mock data
  };
});

// Generate the collections
const mockComplianceCasesDetails = generateMockComplianceCases();
const mockTransactionsData = generateMockTransactions();

// Export individual collections for backward compatibility
export const mockDocuments: Document[] = unifiedMockData.flatMap(user => user.documents);
export const mockComplianceCases: ComplianceCase[] = mockComplianceCasesDetails.map(caseDetails => ({
  id: caseDetails.id,
  userId: caseDetails.userId,
  type: caseDetails.type,
  status: caseDetails.status,
  priority: caseDetails.priority,
  title: caseDetails.description, // Map description to title for compatibility
  description: caseDetails.description,
  assignedTo: caseDetails.assignedTo,
  createdAt: caseDetails.createdAt,
  updatedAt: caseDetails.updatedAt,
  dueDate: caseDetails.createdAt, // Use createdAt as fallback
  tags: [],
  notes: [],
  riskScore: caseDetails.riskScore,
}));
export const mockTransactions: AMLTransaction[] = mockTransactionsData;

// Export the collections that other files are trying to import
export const mockDocumentsCollection = mockDocuments;
export const mockTransactionsCollection = mockTransactions;
export const mockComplianceCasesCollection = mockComplianceCasesDetails;
