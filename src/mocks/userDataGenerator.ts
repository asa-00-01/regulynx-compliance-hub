
import { KYCUser, UserFlags } from '@/types/kyc';

// This file is deprecated - all mock data should come from the centralized compliance context
// Use useCompliance hook to get consistent user data across the application

export const generateMockUser = (id: string): KYCUser & { flags: UserFlags } => {
  console.warn('generateMockUser is deprecated - use compliance context for consistent data');
  
  // Return a basic fallback structure but components should use compliance context
  return {
    id,
    fullName: 'Fallback User',
    email: 'fallback@example.com',
    dateOfBirth: '1990-01-01',
    identityNumber: 'FALLBACK001',
    address: 'Fallback Address',
    phoneNumber: '+1-000-000-0000',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    flags: {
      userId: id,
      is_registered: true,
      is_email_confirmed: true,
      is_verified_pep: false,
      is_sanction_list: false,
      riskScore: 0
    }
  };
};
