
import { EnhancedDocument, DocumentGenerationOptions } from './types';
import { 
  generateUUID, 
  getDocumentStatus, 
  calculateOCRConfidence, 
  generateVerificationSteps,
  generateRandomUploadDate,
  generateVerificationDate
} from './utils';

export const generateMainIdentityDocument = (options: DocumentGenerationOptions): EnhancedDocument => {
  const isPassport = Math.random() > 0.5;
  const uploadDate = generateRandomUploadDate(30);
  
  const documentStatus = getDocumentStatus(options.kycStatus, options.userRiskScore, options.isSanctioned);
  const ocrConfidence = calculateOCRConfidence(options.userRiskScore);
  const verificationSteps = generateVerificationSteps(uploadDate, documentStatus, ocrConfidence, options.userRiskScore);
  
  return {
    id: generateUUID(),
    userId: options.userId,
    type: isPassport ? 'passport' : 'id',
    fileName: `${isPassport ? 'passport' : 'national_id'}_${options.userName.replace(' ', '_')}.pdf`,
    uploadDate,
    status: documentStatus,
    verifiedBy: documentStatus === 'verified' ? generateUUID() : undefined,
    verificationDate: documentStatus === 'verified' ? 
      generateVerificationDate(uploadDate, 25) : undefined,
    extractedData: {
      name: options.userName,
      dob: options.dateOfBirth,
      idNumber: options.personalIdentityNumber,
      nationality: options.nationality,
      expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issueDate: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    verificationSteps,
    ocrConfidence: Math.round(ocrConfidence * 100) / 100,
    biometricMatch: options.userRiskScore < 50 ? Math.random() * 0.1 + 0.9 : Math.random() * 0.3 + 0.7,
    additionalChecks: {
      documentAuthenticity: !options.isSanctioned,
      crossReferenceCheck: documentStatus === 'verified',
      sanctionsScreening: !options.isSanctioned,
      pepScreening: documentStatus === 'verified'
    }
  };
};
