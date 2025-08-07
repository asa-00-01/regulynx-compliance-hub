
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Document } from '@/types/supabase';

export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned';
export type UserRole = 'admin' | 'complianceOfficer' | 'executive' | 'support';

export interface UserPreferences {
  notifications: {
    email: boolean;
    browser: boolean;
    weekly: boolean;
    newCase: boolean;
    riskAlerts: boolean;
  };
  theme: string;
  language: string;
}

export interface StandardUser extends SupabaseUser {
  name: string;
  fullName?: string; // Add optional fullName property
  avatarUrl: string;
  status: UserStatus;
  riskScore: number;
  email: string;
  role: UserRole;
  title?: string;
  department?: string;
  phone?: string;
  location?: string;
  preferences?: UserPreferences;
}

// Add the User interface that was missing
export interface User {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth?: string;
  nationality?: string;
  identityNumber?: string;
  phoneNumber?: string;
  address?: string;
  countryOfResidence?: string;
  riskScore: number;
  isPEP?: boolean;
  isSanctioned?: boolean;
  kycStatus: 'verified' | 'pending' | 'rejected' | 'information_requested';
  createdAt: string;
  documents?: Document[];
  status: UserStatus;
  role: UserRole;
  name?: string; // For backward compatibility
}
