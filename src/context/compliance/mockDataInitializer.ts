
import { UnifiedUserData } from './types';
import { mockUsers } from '@/components/kyc/mockKycData';
import { mockTransactions } from '@/components/aml/mockTransactionData';
import { generateMockDocuments } from '@/components/documents/mockDocumentData';
import { generateMockUser } from '@/mocks/userDataGenerator';
import { Document } from '@/types';

export const initializeMockData = (): UnifiedUserData[] => {
  // Generate 5 mock users with associated data
  const generatedUsers: UnifiedUserData[] = [];
  
  for (let i = 0; i < 5; i++) {
    // Take existing mock users from KYC and combine with generated data
    const kycUser = mockUsers[i] || generateMockUser(i.toString());
    const userTransactions = mockTransactions
      .filter(t => t.senderUserId === kycUser.id || (i < 2 && Math.random() > 0.7))
      .map(t => ({...t, senderUserId: kycUser.id}));
    
    // Generate documents and map them to the correct format
    const mockDocuments = generateMockDocuments(2).map(doc => {
      // Transform the document to match the Document type from @/types
      return {
        id: doc.id,
        userId: kycUser.id,
        type: doc.type,
        fileName: doc.file_name,
        uploadDate: doc.upload_date,
        status: doc.status,
        verifiedBy: doc.verified_by,
        verificationDate: doc.verification_date,
        extractedData: doc.extracted_data
      } as Document;
    });
    
    generatedUsers.push({
      id: kycUser.id,
      fullName: kycUser.fullName,
      email: kycUser.email,
      dateOfBirth: kycUser.dateOfBirth,
      identityNumber: kycUser.identityNumber,
      phoneNumber: kycUser.phoneNumber,
      address: kycUser.address,
      createdAt: kycUser.createdAt,
      kycStatus: kycUser.flags.is_verified_pep ? 'information_requested' : 'pending',
      kycFlags: kycUser.flags,
      riskScore: kycUser.flags.riskScore,
      documents: mockDocuments,
      transactions: userTransactions,
      complianceCases: [],
      isPEP: kycUser.flags.is_verified_pep,
      isSanctioned: kycUser.flags.is_sanction_list,
    });
  }
  
  return generatedUsers;
};
