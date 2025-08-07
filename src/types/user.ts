
import { User as SupabaseUser } from '@supabase/supabase-js';

export type UserStatus = 'verified' | 'pending' | 'flagged';
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
