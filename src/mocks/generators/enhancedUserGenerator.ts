
import { UnifiedUserData } from '@/context/compliance/types';

// Enhanced user profiles with more realistic attributes
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

// Generate realistic Swedish personal identity numbers
const generatePersonalIdentityNumber = (dateOfBirth: string): string => {
  const date = new Date(dateOfBirth);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const lastFour = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${year}${month}${day}${lastFour}`;
};

// Generate realistic email confirmation tokens
const generateEmailToken = (): string => {
  return Array.from({ length: 8 }, () => Math.random().toString(36).substring(2, 4)).join('-');
};

// Enhanced user profiles with realistic Swedish and international names
export const enhancedUserProfiles: EnhancedUserProfile[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    personalIdentityNumber: '198703242381',
    firstName: 'Elin',
    lastName: 'West',
    fullName: 'Elin West',
    dateOfBirth: '1987-03-24',
    phoneNumber: '0700123456',
    email: 'elin.west@gmail.com',
    emailConfirmationToken: '75cdc06c-7f90-458a-abbc-d9d1415cf4ad',
    emailConfirmationTokenExpiresAt: '2023-12-20 12:02:19',
    emailConsent: true,
    briteCustomerId: null,
    lastLogin: null,
    screenedAt: '2024-04-25 09:10:46',
    transferHabit: 'lessThanfiveThousandSEK',
    frequencyOfTransaction: 'atleastTwoTimesPerMonth',
    receiverCountries: ['Somaliland', 'Somalia'],
    sendToMultipleRecipients: false,
    recipientRelationship: ['family', 'friends'],
    originsOfFunds: ['salary', 'otherIncome'],
    nationality: 'Swedish',
    countryOfResidence: 'Sweden',
    address: 'Storgatan 12, 111 22 Stockholm, Sweden',
    kycStatus: 'verified',
    riskScore: 65,
    isPEP: false,
    isSanctioned: false,
    createdAt: '2023-10-24 09:41:54',
    updatedAt: '2024-04-25 09:10:46',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    personalIdentityNumber: '199205151234',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    fullName: 'Ahmed Hassan',
    dateOfBirth: '1992-05-15',
    phoneNumber: '0731234567',
    email: 'ahmed.hassan@outlook.com',
    emailConfirmationToken: generateEmailToken(),
    emailConfirmationTokenExpiresAt: '2024-01-15 15:30:00',
    emailConsent: true,
    briteCustomerId: 'BRITE_001',
    lastLogin: '2024-06-14 08:30:00',
    screenedAt: '2024-06-10 14:20:00',
    transferHabit: 'fiveToTenThousandSEK',
    frequencyOfTransaction: 'oncePerWeek',
    receiverCountries: ['Egypt', 'Jordan', 'Lebanon'],
    sendToMultipleRecipients: true,
    recipientRelationship: ['family', 'business'],
    originsOfFunds: ['salary', 'business'],
    nationality: 'Egyptian',
    countryOfResidence: 'Sweden',
    address: 'Vasagatan 8, 411 37 Göteborg, Sweden',
    kycStatus: 'pending',
    riskScore: 78,
    isPEP: false,
    isSanctioned: false,
    createdAt: '2023-08-15 11:20:30',
    updatedAt: '2024-06-14 08:30:00',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    personalIdentityNumber: '198912103456',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    fullName: 'Maria Rodriguez',
    dateOfBirth: '1989-12-10',
    phoneNumber: '0765432198',
    email: 'maria.rodriguez@hotmail.com',
    emailConsent: false,
    briteCustomerId: 'BRITE_002',
    lastLogin: '2024-06-13 19:45:00',
    screenedAt: '2024-05-20 10:15:00',
    transferHabit: 'moreThanTenThousandSEK',
    frequencyOfTransaction: 'moreThanOncePerWeek',
    receiverCountries: ['Spain', 'Colombia', 'Mexico'],
    sendToMultipleRecipients: true,
    recipientRelationship: ['family', 'friends', 'business'],
    originsOfFunds: ['business', 'investments'],
    nationality: 'Spanish',
    countryOfResidence: 'Sweden',
    address: 'Malmövägen 45, 214 28 Malmö, Sweden',
    kycStatus: 'information_requested',
    riskScore: 85,
    isPEP: true,
    isSanctioned: false,
    createdAt: '2023-11-02 16:45:12',
    updatedAt: '2024-06-13 19:45:00',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    personalIdentityNumber: '199408227890',
    firstName: 'Lars',
    lastName: 'Andersson',
    fullName: 'Lars Andersson',
    dateOfBirth: '1994-08-22',
    phoneNumber: '0708765432',
    email: 'lars.andersson@gmail.com',
    emailConsent: true,
    lastLogin: '2024-06-15 07:20:00',
    screenedAt: '2024-06-01 09:00:00',
    transferHabit: 'oneToFiveThousandSEK',
    frequencyOfTransaction: 'oncePerMonth',
    receiverCountries: ['Norway', 'Denmark', 'Finland'],
    sendToMultipleRecipients: false,
    recipientRelationship: ['family'],
    originsOfFunds: ['salary'],
    nationality: 'Swedish',
    countryOfResidence: 'Sweden',
    address: 'Kungsgatan 22, 753 10 Uppsala, Sweden',
    kycStatus: 'verified',
    riskScore: 25,
    isPEP: false,
    isSanctioned: false,
    createdAt: '2024-01-10 12:30:00',
    updatedAt: '2024-06-15 07:20:00',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    personalIdentityNumber: '198506309876',
    firstName: 'Fatima',
    lastName: 'Al-Zahra',
    fullName: 'Fatima Al-Zahra',
    dateOfBirth: '1985-06-30',
    phoneNumber: '0739876543',
    email: 'fatima.alzahra@yahoo.com',
    emailConfirmationToken: generateEmailToken(),
    emailConfirmationTokenExpiresAt: '2024-07-01 12:00:00',
    emailConsent: true,
    briteCustomerId: 'BRITE_003',
    lastLogin: '2024-06-12 14:30:00',
    screenedAt: '2024-03-15 11:45:00',
    transferHabit: 'fiveToTenThousandSEK',
    frequencyOfTransaction: 'atleastTwoTimesPerMonth',
    receiverCountries: ['Iraq', 'Syria', 'Turkey'],
    sendToMultipleRecipients: true,
    recipientRelationship: ['family', 'friends'],
    originsOfFunds: ['salary', 'savings'],
    nationality: 'Iraqi',
    countryOfResidence: 'Sweden',
    address: 'Roslagsgatan 15, 113 55 Stockholm, Sweden',
    kycStatus: 'rejected',
    riskScore: 92,
    isPEP: false,
    isSanctioned: true,
    createdAt: '2023-07-20 08:15:30',
    updatedAt: '2024-06-12 14:30:00',
  }
];

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
