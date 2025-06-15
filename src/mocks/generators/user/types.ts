
import { UnifiedUserData } from '@/context/compliance/types';

export interface EnhancedUserProfile {
  id: string;
  personalIdentityNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  emailConfirmationToken?: string;
  emailConfirmationTokenExpiresAt?: string;
  emailConsent: boolean;
  briteCustomerId?: string;
  lastLogin?: string;
  screenedAt?: string;
  transferHabit: 'lessThanOneThousandSEK' | 'oneToFiveThousandSEK' | 'lessThanfiveThousandSEK' | 'fiveToTenThousandSEK' | 'moreThanTenThousandSEK';
  frequencyOfTransaction: 'lessThanOncePerMonth' | 'oncePerMonth' | 'atleastTwoTimesPerMonth' | 'oncePerWeek' | 'moreThanOncePerWeek';
  receiverCountries: string[];
  sendToMultipleRecipients: boolean;
  recipientRelationship: ('family' | 'friends' | 'business' | 'other')[];
  originsOfFunds: ('salary' | 'business' | 'investments' | 'savings' | 'otherIncome' | 'inheritance')[];
  nationality: string;
  countryOfResidence: string;
  address: string;
  kycStatus: 'verified' | 'pending' | 'rejected' | 'information_requested';
  riskScore: number;
  isPEP: boolean;
  isSanctioned: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
