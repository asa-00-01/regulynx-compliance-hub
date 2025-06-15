
import { EnhancedDocument, DocumentGenerationOptions } from './types';
import { 
  generateUUID, 
  generateRandomUploadDate,
  generateVerificationDate
} from './utils';

export const generateSourceOfFundsDocument = (options: DocumentGenerationOptions): EnhancedDocument => {
  const uploadDate = generateRandomUploadDate(10);
  
  return {
    id: generateUUID(),
    userId: options.userId,
    type: 'passport', // Using passport type for financial documents
    fileName: `source_of_funds_${options.userName.replace(' ', '_')}.pdf`,
    uploadDate,
    status: 'pending',
    extractedData: {
      sourceType: options.originsOfFunds.join(', '),
      amount: `${Math.floor(Math.random() * 100000) + 50000} SEK/month`,
      verificationRequired: 'Enhanced due diligence required'
    },
    verificationSteps: [
      {
        step: 1,
        name: 'Document Classification',
        status: 'completed',
        completedAt: generateVerificationDate(uploadDate, 2)
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
      pepScreening: options.isPEP
    }
  };
};

export const generateFinancialDocument = (options: DocumentGenerationOptions): EnhancedDocument => {
  const uploadDate = generateRandomUploadDate(7);
  
  return {
    id: generateUUID(),
    userId: options.userId,
    type: 'id',
    fileName: `bank_statement_${options.userName.replace(' ', '_')}.pdf`,
    uploadDate,
    status: 'pending',
    extractedData: {
      accountHolder: options.userName,
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
