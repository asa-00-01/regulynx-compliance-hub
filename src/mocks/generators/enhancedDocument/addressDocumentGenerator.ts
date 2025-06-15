
import { EnhancedDocument, DocumentGenerationOptions } from './types';
import { 
  generateUUID, 
  generateRandomUploadDate,
  generateVerificationDate
} from './utils';

export const generateAddressDocument = (options: DocumentGenerationOptions): EnhancedDocument => {
  const uploadDate = generateRandomUploadDate(20);
  const documentStatus: 'pending' | 'verified' | 'rejected' = 
    options.kycStatus === 'verified' ? 'verified' : 
    options.kycStatus === 'rejected' ? 'rejected' : 'pending';
  
  return {
    id: generateUUID(),
    userId: options.userId,
    type: 'license', // Using license type for address proof
    fileName: `address_proof_${options.userName.replace(' ', '_')}.pdf`,
    uploadDate,
    status: documentStatus,
    verifiedBy: documentStatus === 'verified' ? generateUUID() : undefined,
    verificationDate: documentStatus === 'verified' ? 
      generateVerificationDate(uploadDate, 120) : undefined,
    extractedData: {
      name: options.userName,
      address: options.address,
      issueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    verificationSteps: [
      {
        step: 1,
        name: 'Address Extraction',
        status: 'completed',
        completedAt: generateVerificationDate(uploadDate, 3)
      },
      {
        step: 2,
        name: 'Address Validation',
        status: documentStatus === 'verified' ? 'completed' : 'pending',
        completedAt: documentStatus === 'verified' ? 
          generateVerificationDate(uploadDate, 10) : undefined
      }
    ],
    ocrConfidence: 0.92,
    additionalChecks: {
      documentAuthenticity: true,
      crossReferenceCheck: documentStatus === 'verified',
      sanctionsScreening: true,
      pepScreening: true
    }
  };
};
