
import { generateUUID } from '../user/utils';
import { DocumentVerificationStep } from './types';

export const getDocumentStatus = (
  userKycStatus: string,
  userRiskScore: number,
  isSanctioned: boolean
): 'pending' | 'verified' | 'rejected' | 'information_requested' => {
  if (isSanctioned) {
    return 'rejected';
  } else if (userKycStatus === 'information_requested') {
    return 'information_requested';
  } else if (userKycStatus === 'verified' && userRiskScore < 70) {
    return 'verified';
  } else {
    return 'pending';
  }
};

export const calculateOCRConfidence = (userRiskScore: number): number => {
  return userRiskScore > 80 ? 
    Math.random() * 0.3 + 0.6 : // Lower confidence for high-risk users
    Math.random() * 0.2 + 0.85;  // Higher confidence for normal users
};

export const generateVerificationSteps = (
  uploadDate: string,
  documentStatus: string,
  ocrConfidence: number,
  userRiskScore: number
): DocumentVerificationStep[] => {
  const steps: DocumentVerificationStep[] = [
    {
      step: 1,
      name: 'OCR Text Extraction',
      status: 'completed',
      completedAt: new Date(new Date(uploadDate).getTime() + 5 * 60 * 1000).toISOString(),
      notes: `OCR confidence: ${Math.round(ocrConfidence * 100)}%`
    },
    {
      step: 2,
      name: 'Document Format Validation',
      status: 'completed',
      completedAt: new Date(new Date(uploadDate).getTime() + 10 * 60 * 1000).toISOString()
    },
    {
      step: 3,
      name: 'Security Features Check',
      status: documentStatus === 'verified' ? 'completed' : 'requires_review',
      completedAt: documentStatus === 'verified' ? 
        new Date(new Date(uploadDate).getTime() + 15 * 60 * 1000).toISOString() : undefined,
      notes: userRiskScore > 70 ? 'Manual verification required' : undefined
    },
    {
      step: 4,
      name: 'Cross-Reference Verification',
      status: documentStatus === 'verified' ? 'completed' : 'pending',
      completedAt: documentStatus === 'verified' ? 
        new Date(new Date(uploadDate).getTime() + 20 * 60 * 1000).toISOString() : undefined
    }
  ];

  return steps;
};

export const generateRandomUploadDate = (maxDaysAgo: number): string => {
  return new Date(Date.now() - Math.random() * maxDaysAgo * 24 * 60 * 60 * 1000).toISOString();
};

export const generateVerificationDate = (uploadDate: string, minutesLater: number): string => {
  return new Date(new Date(uploadDate).getTime() + minutesLater * 60 * 1000).toISOString();
};

export { generateUUID };
