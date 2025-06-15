
import { UnifiedUserData } from '@/context/compliance/types';
import { EnhancedUserProfile } from './types';

// Convert enhanced profiles to unified format
export const convertToUnifiedUserData = (profile: EnhancedUserProfile): UnifiedUserData => {
  return {
    id: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    dateOfBirth: profile.dateOfBirth,
    nationality: profile.nationality,
    identityNumber: profile.personalIdentityNumber,
    phoneNumber: profile.phoneNumber,
    address: profile.address,
    countryOfResidence: profile.countryOfResidence,
    riskScore: profile.riskScore,
    isPEP: profile.isPEP,
    isSanctioned: profile.isSanctioned,
    kycStatus: profile.kycStatus,
    createdAt: profile.createdAt,
    kycFlags: {
      userId: profile.id,
      is_registered: true,
      is_email_confirmed: profile.emailConsent,
      is_verified_pep: profile.isPEP,
      is_sanction_list: profile.isSanctioned,
      riskScore: profile.riskScore
    },
    documents: [],
    transactions: [],
    complianceCases: [],
    notes: []
  };
};
