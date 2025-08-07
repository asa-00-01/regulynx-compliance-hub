
import { UnifiedUserData } from '@/context/compliance/types';
import { Document, ComplianceCase } from '@/types';
import { AMLTransaction } from '@/types/aml';
import { enhancedUserProfiles, convertToUnifiedUserData } from './generators/enhancedUserGenerator';
import { generateEnhancedDocuments, EnhancedDocument } from './generators/enhancedDocumentGenerator';

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

// Export individual components for backward compatibility
export const mockDocuments: Document[] = unifiedMockData.flatMap(user => user.documents);
export const mockComplianceCases: ComplianceCase[] = unifiedMockData.flatMap(user => user.complianceCases);
export const mockTransactions: AMLTransaction[] = unifiedMockData.flatMap(user => user.transactions);
