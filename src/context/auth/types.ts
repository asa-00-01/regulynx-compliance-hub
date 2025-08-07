
import { Session } from '@supabase/supabase-js';
import { StandardUser } from '@/types/user';
import { CustomerRole, PlatformRole } from '@/hooks/useRoleBasedPermissions';

export interface AuthContextType {
  // Core auth state
  user: StandardUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  authLoaded: boolean;
  
  // Role-based permissions
  customerRoles: CustomerRole[];
  platformRoles: PlatformRole[];
  isPlatformUser: boolean;
  isCustomerUser: boolean;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUserProfile: (updates: any) => Promise<void>;
  
  // Legacy compatibility
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  canAccess: (roles: string[]) => boolean;
}
