
import { Document } from '@/types';
import { EnhancedUserProfile } from './enhancedUserGenerator';

// Generate UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface DocumentVerificationStep {
  step: number;
  name: string;
  status: 'pending' | 'completed' | 'failed' | 'requires_review';
  completedAt?: string;
  notes?: string;
}

export interface EnhancedDocument extends Document {
  verificationSteps: DocumentVerificationStep[];
  ocrConfidence: number;
  biometricMatch?: number;
  additionalChecks: {
    documentAuthenticity: boolean;
    crossReferenceCheck: boolean;
    sanctionsScreening: boolean;
    pepScreening: boolean;
  };
}

export const generateEnhancedDocuments = (user: EnhancedUserProfile): EnhancedDocument[] => {
  const documents: EnhancedDocument[] = [];
  
  // Main identity document (passport or national ID)
  const mainDocument = generateMainIdentityDocument(user);
  documents.push(mainDocument);
  
  // Address verification document
  const addressDocument = generateAddressDocument(user);
  documents.push(addressDocument);
  
  // Additional documents based on risk profile
  if (user.riskScore > 70 || user.isPEP) {
    const sourceOfFundsDocument = generateSourceOfFundsDocument(user);
    documents.push(sourceOfFundsDocument);
  }
  
  if (user.transferHabit === 'moreThanTenThousandSEK') {
    const financialDocument = generateFinancialDocument(user);
    documents.push(financialDocument);
  }
  
  return documents;
};

const generateMainIdentityDocument = (user: EnhancedUserProfile): EnhancedDocument => {
  const isPassport = Math.random() > 0.5;
  const uploadDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
  
  // Document status based on user KYC status and risk
  let documentStatus: 'pending' | 'verified' | 'rejected' | 'information_requested';
  if (user.isSanctioned) {
    documentStatus = 'rejected';
  } else if (user.kycStatus === 'information_requested') {
    documentStatus = 'information_requested';
  } else if (user.kycStatus === 'verified' && user.riskScore < 70) {
    documentStatus = 'verified';
  } else {
    documentStatus = 'pending';
  }
  
  // OCR confidence based on document quality
  const ocrConfidence = user.riskScore > 80 ? 
    Math.random() * 0.3 + 0.6 : // Lower confidence for high-risk users
    Math.random() * 0.2 + 0.85;  // Higher confidence for normal users
  
  // Verification steps
  const verificationSteps: DocumentVerificationStep[] = [
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
      notes: user.riskScore > 70 ? 'Manual verification required' : undefined
    },
    {
      step: 4,
      name: 'Cross-Reference Verification',
      status: documentStatus === 'verified' ? 'completed' : 'pending',
      completedAt: documentStatus === 'verified' ? 
        new Date(new Date(uploadDate).getTime() + 20 * 60 * 1000).toISOString() : undefined
    }
  ];
  
  return {
    id: generateUUID(),
    userId: user.id,
    type: isPassport ? 'passport' : 'other',
    fileName: `${isPassport ? 'passport' : 'national_id'}_${user.firstName}_${user.lastName}.pdf`,
    uploadDate,
    status: documentStatus,
    verifiedBy: documentStatus === 'verified' ? generateUUID() : undefined,
    verificationDate: documentStatus === 'verified' ? 
      new Date(new Date(uploadDate).getTime() + 25 * 60 * 1000).toISOString() : undefined,
    extractedData: {
      name: user.fullName,
      dob: user.dateOfBirth,
      idNumber: user.personalIdentityNumber,
      nationality: user.nationality,
      expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issueDate: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    verificationSteps,
    ocrConfidence: Math.round(ocrConfidence * 100) / 100,
    biometricMatch: user.riskScore < 50 ? Math.random() * 0.1 + 0.9 : Math.random() * 0.3 + 0.7,
    additionalChecks: {
      documentAuthenticity: !user.isSanctioned,
      crossReferenceCheck: documentStatus === 'verified',
      sanctionsScreening: !user.isSanctioned,
      pepScreening: documentStatus === 'verified'
    }
  };
};

const generateAddressDocument = (user: EnhancedUserProfile): EnhancedDocument => {
  const uploadDate = new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString();
  const documentStatus: 'pending' | 'verified' | 'rejected' = 
    user.kycStatus === 'verified' ? 'verified' : 
    user.kycStatus === 'rejected' ? 'rejected' : 'pending';
  
  return {
    id: generateUUID(),
    userId: user.id,
    type: 'utility_bill',
    fileName: `address_proof_${user.firstName}_${user.lastName}.pdf`,
    uploadDate,
    status: documentStatus,
    verifiedBy: documentStatus === 'verified' ? generateUUID() : undefined,
    verificationDate: documentStatus === 'verified' ? 
      new Date(new Date(uploadDate).getTime() + 2 * 60 * 60 * 1000).toISOString() : undefined,
    extractedData: {
      name: user.fullName,
      address: user.address,
      issueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    verificationSteps: [
      {
        step: 1,
        name: 'Address Extraction',
        status: 'completed',
        completedAt: new Date(new Date(uploadDate).getTime() + 3 * 60 * 1000).toISOString()
      },
      {
        step: 2,
        name: 'Address Validation',
        status: documentStatus === 'verified' ? 'completed' : 'pending',
        completedAt: documentStatus === 'verified' ? 
          new Date(new Date(uploadDate).getTime() + 10 * 60 * 1000).toISOString() : undefined
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

const generateSourceOfFundsDocument = (user: EnhancedUserProfile): EnhancedDocument => {
  const uploadDate = new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString();
  
  return {
    id: generateUUID(),
    userId: user.id,
    type: 'bank_statement',
    fileName: `source_of_funds_${user.firstName}_${user.lastName}.pdf`,
    uploadDate,
    status: 'pending',
    extractedData: {
      sourceType: user.originsOfFunds.join(', '),
      amount: `${Math.floor(Math.random() * 100000) + 50000} SEK/month`,
      verificationRequired: 'Enhanced due diligence required'
    },
    verificationSteps: [
      {
        step: 1,
        name: 'Document Classification',
        status: 'completed',
        completedAt: new Date(new Date(uploadDate).getTime() + 2 * 60 * 1000).toISOString()
      },
      {
        step: 2,
        name: 'Source Verification',
        status: 'requires_review',
        notes: 'Requires manual compliance review'
      }
    ],
    ocrConfidence: 0.88,
    additionalChecks: {
      documentAuthenticity: true,
      crossReferenceCheck: false,
      sanctionsScreening: true,
      pepScreening: user.isPEP
    }
  };
};

const generateFinancialDocument = (user: EnhancedUserProfile): EnhancedDocument => {
  const uploadDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
  
  return {
    id: generateUUID(),
    userId: user.id,
    type: 'other',
    fileName: `bank_statement_${user.firstName}_${user.lastName}.pdf`,
    uploadDate,
    status: 'pending',
    extractedData: {
      accountHolder: user.fullName,
      averageBalance: `${Math.floor(Math.random() * 500000) + 100000} SEK`,
      transactionHistory: 'Last 3 months included'
    },
    verificationSteps: [
      {
        step: 1,
        name: 'Financial Analysis',
        status: 'pending',
        notes: 'Awaiting compliance review'
      }
    ],
    ocrConfidence: 0.95,
    additionalChecks: {
      documentAuthenticity: true,
      crossReferenceCheck: false,
      sanctionsScreening: true,
      pepScreening: true
    }
  };
};
