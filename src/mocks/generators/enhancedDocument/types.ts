
import { Document } from '@/types';

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

export interface DocumentGenerationOptions {
  userId: string;
  userName: string;
  userRiskScore: number;
  kycStatus: 'verified' | 'pending' | 'rejected' | 'information_requested';
  isPEP: boolean;
  isSanctioned: boolean;
  transferHabit: string;
  address: string;
  dateOfBirth: string;
  nationality: string;
  personalIdentityNumber: string;
  originsOfFunds: string[];
}
