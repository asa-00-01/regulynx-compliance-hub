
import { User, UserRole } from '@/types';

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

export interface ExtendedUser extends User {
  title?: string;
  department?: string;
  phone?: string;
  location?: string;
  preferences?: UserPreferences;
}
