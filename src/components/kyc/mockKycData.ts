
import { KYCUser, UserFlags, KYCVerification, KYCStatus } from '@/types/kyc';
import { useCompliance } from '@/context/ComplianceContext';
import { UnifiedUserData } from '@/context/compliance/types';

// This function will be used to get users from the centralized compliance context
export const getKYCUsersFromContext = () => {
  // This is a helper function that components can use to get consistent data
  // The actual data fetching should be done in the component using useCompliance hook
  return [];
};

// Convert unified user data to KYC format for backward compatibility
export const convertToKYCUsers = (unifiedUsers: UnifiedUserData[]): (KYCUser & { flags: UserFlags; kycStatus?: KYCStatus })[] => {
  return unifiedUsers.map(user => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    dateOfBirth: user.dateOfBirth || '',
    identityNumber: user.identityNumber || '',
    phoneNumber: user.phoneNumber || '',
    address: user.address || '',
    createdAt: user.createdAt,
    updatedAt: user.createdAt,
    flags: user.kycFlags,
    kycStatus: user.kycStatus as KYCStatus // Cast to proper KYCStatus type
  }));
};

export const convertToKYCVerifications = (unifiedUsers: UnifiedUserData[]): KYCVerification[] => {
  return unifiedUsers.map(user => {
    const getVerificationStatus = () => {
      switch (user.kycStatus) {
        case 'verified': return 'verified';
        case 'pending': return 'pending';
        case 'rejected': return 'rejected';
        case 'information_requested': return 'information_requested';
        default: return 'pending';
      }
    };

    const status = getVerificationStatus();
    const notes = [];
    
    if (user.isPEP) notes.push('PEP status confirmed');
    if (user.isSanctioned) notes.push('Found on sanctions list');
    if (user.riskScore > 70) notes.push('High risk score requires enhanced due diligence');
    
    return {
      userId: user.id,
      status,
      verifiedBy: status === 'verified' ? 'admin' : undefined,
      verifiedAt: status === 'verified' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      rejectionReason: status === 'rejected' ? 'Sanctioned individual' : undefined,
      notes: notes.length > 0 ? notes : ['Standard verification process']
    };
  });
};

// For backward compatibility, export empty arrays but components should use the compliance context
export const mockUsers: (KYCUser & { flags: UserFlags })[] = [];
export const mockVerifications: KYCVerification[] = [];
