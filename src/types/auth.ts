
import { PlatformRole, CustomerRole, Customer } from '@/types/platform-roles';

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

export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole; // Legacy role for backward compatibility
  riskScore: number;
  status: 'verified' | 'pending' | 'rejected' | 'information_requested';
  avatarUrl?: string;
  title?: string;
  department?: string;
  phone?: string;
  location?: string;
  preferences?: UserPreferences;
  
  // New platform-aware fields
  customer_id?: string;
  platform_roles: PlatformRole[];
  customer_roles: CustomerRole[];
  customer?: Customer;
  isPlatformOwner: boolean;
}

// Legacy User type for backward compatibility - updated to match ExtendedUser
export interface User extends ExtendedUser {}

// Helper type for role checking
export type UserRole = 'admin' | 'complianceOfficer' | 'executive' | 'support';
