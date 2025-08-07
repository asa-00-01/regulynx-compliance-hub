
import { Document } from '@/types';
import { userProfiles } from './userGenerator';

const getRandomDateInPast = (daysBack: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
};

export const generateDocumentsForUser = (user: typeof userProfiles[0]): Document[] => {
  const documentTypes: ('passport' | 'id' | 'license')[] = ['passport', 'id', 'license'];
  const documents: Document[] = [];
  
  documentTypes.forEach((type, index) => {
    let status: 'pending' | 'verified' | 'rejected' | 'information_requested';
    
    // Determine status based on user's KYC status and risk score
    if (user.kycStatus === 'rejected' || user.isSanctioned) {
      status = 'rejected';
    } else if (user.kycStatus === 'information_requested') {
      status = Math.random() > 0.5 ? 'information_requested' : 'pending';
    } else if (user.kycStatus === 'verified') {
      status = index === 0 ? 'verified' : (Math.random() > 0.3 ? 'verified' : 'pending');
    } else {
      status = Math.random() > 0.6 ? 'pending' : 'verified';
    }
    
    const uploadDate = getRandomDateInPast(60);
    const verificationDate = status === 'verified' ? 
      new Date(new Date(uploadDate).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : 
      undefined;
    
    documents.push({
      id: `doc_${user.id}_${type}`,
      userId: user.id,
      type,
      fileName: `${type}_${user.fullName.replace(/\s+/g, '_')}.pdf`,
      uploadDate,
      status,
      verifiedBy: status === 'verified' ? 'admin_001' : undefined,
      verificationDate,
      extractedData: {
        name: user.fullName,
        dob: user.dateOfBirth,
        idNumber: user.identityNumber,
        nationality: user.nationality,
        expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    });
  });
  
  // High-risk users might have additional documents
  if (user.riskScore > 70 || user.isPEP) {
    documents.push({
      id: `doc_${user.id}_additional`,
      userId: user.id,
      type: 'passport',
      fileName: `additional_passport_${user.fullName.replace(/\s+/g, '_')}.pdf`,
      uploadDate: getRandomDateInPast(30),
      status: 'pending',
      extractedData: {
        name: user.fullName,
        dob: user.dateOfBirth,
        idNumber: user.identityNumber + '_ALT',
        nationality: user.nationality
      }
    });
  }
  
  return documents;
};

export const generateAllDocuments = (): Document[] => {
  return userProfiles.flatMap(user => generateDocumentsForUser(user));
};
