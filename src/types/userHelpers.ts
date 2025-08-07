
import { StandardUser, UserRole, UserStatus, UserPreferences } from './user';

export interface CreateUserData {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  riskScore: number;
  status: UserStatus;
  avatarUrl?: string;
  title?: string;
  department?: string;
  phone?: string;
  location?: string;
  preferences?: UserPreferences;
}

export const createStandardUser = (userData: CreateUserData): StandardUser => {
  return {
    // Supabase User required properties
    id: userData.id || crypto.randomUUID(),
    email: userData.email,
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    
    // Extended properties
    name: userData.name,
    avatarUrl: userData.avatarUrl || `https://i.pravatar.cc/150?u=${userData.email}`,
    status: userData.status,
    riskScore: userData.riskScore,
    role: userData.role,
    title: userData.title,
    department: userData.department,
    phone: userData.phone,
    location: userData.location,
    preferences: userData.preferences,
  };
};
