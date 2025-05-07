
export interface KYCUser {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  identityNumber: string;
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFlags {
  userId: string;
  is_registered: boolean;
  is_email_confirmed: boolean;
  is_verified_pep: boolean;
  is_sanction_list: boolean;
  riskScore: number; // 0-100
}

export type KYCStatus = 'verified' | 'pending' | 'rejected' | 'information_requested';

export interface KYCVerification {
  userId: string;
  status: KYCStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  notes?: string[];
}
