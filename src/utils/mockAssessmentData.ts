
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';
import { ComplianceCaseDetails } from '@/types/compliance-cases';

export const mockAMLTransaction: AMLTransaction = {
  id: 'txn_001',
  senderUserId: 'user_001',
  senderName: 'John Doe',
  senderCountryCode: 'US',
  senderCurrency: 'USD',
  senderAmount: 15000,
  receiverUserId: 'user_002', 
  receiverName: 'Jane Smith',
  receiverCountryCode: 'CA',
  receiverCurrency: 'CAD',
  receiverAmount: 19500,
  exchangeRate: 1.3,
  timestamp: new Date().toISOString(),
  method: 'bank',
  status: 'completed',
  riskScore: 85,
  isSuspect: true,
  suspectReasons: ['High amount', 'Cross-border'],
  complianceNotes: ['Requires enhanced due diligence'],
  metadata: {}
};

export const mockUser: UnifiedUserData = {
  id: 'user_001',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  dateOfBirth: '1985-03-15',
  nationality: 'US',
  identityNumber: 'SSN123456789',
  phoneNumber: '+1-555-0123',
  address: '123 Main St, Anytown, USA',
  countryOfResidence: 'US',
  riskScore: mockAMLTransaction.riskScore,
  isPEP: false,
  isSanctioned: false,
  kycStatus: 'verified',
  createdAt: new Date().toISOString(),
  kycFlags: {
    userId: 'user_001',
    is_registered: true,
    is_email_confirmed: true,
    is_verified_pep: false,
    is_sanction_list: false,
    riskScore: 85
  },
  documents: [],
  transactions: [mockAMLTransaction],
  complianceCases: [],
  notes: []
};
