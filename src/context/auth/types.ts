
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Define the user role type to match your existing types
export type UserRole = 'complianceOfficer' | 'admin' | 'executive' | 'support';

// Extended user interface that includes profile data
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatarUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  authLoaded: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (email: string, password: string, role: UserRole, name?: string) => Promise<void>;
  isAuthenticated: boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
  session: Session | null;
}

// Mock user for testing
export const MOCK_USER: User = {
  id: 'mock-user-123',
  email: 'compliance@regulynx.com',
  role: 'complianceOfficer',
  name: 'Mock Compliance Officer',
  avatarUrl: undefined,
};
