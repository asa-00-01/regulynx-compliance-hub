
import { KYCUser, UserFlags, KYCVerification } from '@/types/kyc';

export const mockUsers: (KYCUser & { flags: UserFlags })[] = [
  {
    id: '1',
    fullName: 'John Smith',
    email: 'john.smith@example.com',
    dateOfBirth: '1985-05-15',
    identityNumber: 'ABC123456789',
    phoneNumber: '+1234567890',
    address: '123 Main St, Anytown, USA',
    createdAt: '2023-01-15T12:00:00Z',
    updatedAt: '2023-01-15T12:00:00Z',
    flags: {
      userId: '1',
      is_registered: true,
      is_email_confirmed: true,
      is_verified_pep: false,
      is_sanction_list: false,
      riskScore: 15
    }
  },
  {
    id: '2',
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    dateOfBirth: '1990-10-20',
    identityNumber: 'XYZ987654321',
    phoneNumber: '+9876543210',
    address: '456 Oak Ave, Somewhere, USA',
    createdAt: '2023-02-20T14:30:00Z',
    updatedAt: '2023-02-20T14:30:00Z',
    flags: {
      userId: '2',
      is_registered: true,
      is_email_confirmed: true,
      is_verified_pep: true,
      is_sanction_list: false,
      riskScore: 65
    }
  },
  {
    id: '3',
    fullName: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    dateOfBirth: '1978-03-08',
    identityNumber: '',
    phoneNumber: '',
    address: '',
    createdAt: '2023-03-10T09:15:00Z',
    updatedAt: '2023-03-10T09:15:00Z',
    flags: {
      userId: '3',
      is_registered: true,
      is_email_confirmed: false,
      is_verified_pep: false,
      is_sanction_list: false,
      riskScore: 35
    }
  },
  {
    id: '4',
    fullName: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    dateOfBirth: '1995-12-12',
    identityNumber: 'DEF567891234',
    phoneNumber: '+1122334455',
    address: '789 Elm St, Nowhere, USA',
    createdAt: '2023-04-05T11:45:00Z',
    updatedAt: '2023-04-05T11:45:00Z',
    flags: {
      userId: '4',
      is_registered: true,
      is_email_confirmed: true,
      is_verified_pep: false,
      is_sanction_list: false,
      riskScore: 5
    }
  },
  {
    id: '5',
    fullName: 'Ahmed Khalid',
    email: 'ahmed.khalid@example.com',
    dateOfBirth: '1982-07-25',
    identityNumber: 'GHI234567890',
    phoneNumber: '+5566778899',
    address: '101 Pine Rd, Anytown, USA',
    createdAt: '2023-05-12T16:20:00Z',
    updatedAt: '2023-05-12T16:20:00Z',
    flags: {
      userId: '5',
      is_registered: true,
      is_email_confirmed: true,
      is_verified_pep: false,
      is_sanction_list: true,
      riskScore: 95
    }
  }
];

export const mockVerifications: KYCVerification[] = [
  {
    userId: '1',
    status: 'verified',
    verifiedBy: 'admin',
    verifiedAt: '2023-01-20T14:30:00Z',
    notes: ['All documents verified', 'Identity confirmed']
  },
  {
    userId: '2',
    status: 'verified',
    verifiedBy: 'admin',
    verifiedAt: '2023-02-25T10:15:00Z',
    notes: ['PEP status confirmed', 'Enhanced due diligence completed']
  },
  {
    userId: '3',
    status: 'information_requested',
    notes: ['Missing identity document', 'Email not verified']
  },
  {
    userId: '4',
    status: 'verified',
    verifiedBy: 'admin',
    verifiedAt: '2023-04-10T09:45:00Z',
    notes: ['All checks passed']
  },
  {
    userId: '5',
    status: 'rejected',
    verifiedBy: 'admin',
    verifiedAt: '2023-05-15T13:20:00Z',
    rejectionReason: 'Appears on sanctions list',
    notes: ['Found on international sanctions list', 'Account blocked']
  }
];
